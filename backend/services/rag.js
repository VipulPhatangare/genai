const { GoogleGenerativeAI } = require('@google/generative-ai');
const Employee = require('../models/Employee');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SCHEMA = `
MongoDB collection name: employees

Fields and types:
  Department              string   – e.g. "IT", "HR", "Sales", "Finance", "Marketing", "Operations"
  Job_Title               string   – e.g. "Manager", "Developer", "Analyst", "Engineer"
  Performance_Rating      number   – 1–15 scale
  performance_group       string   – "Low" (≤5), "Mid" (6–9), "High" (≥10)
  Employee_Resignation_Status  string – "Yes" or "No"
  Employee_Engagement_Score    number – 1–10
  Employee_Job_Satisfaction_Score number – 1–10
  Employee_Work_Life_Balance_Rating   number – 1–10
  Technical_Skills_Rating      number – 1–10
  Leadership_Qualities_Rating  number – 1–10
  Communication_Skills_Rating  number – 1–10
  Problem_Solving_Skills_Rating number – 1–10
  Teamwork_Skills_Rating       number – 1–10
  Initiative_Rating            number – 1–10
  Adaptability_Rating          number – 1–10
  Creativity_Rating            number – 1–10
  Strategic_Thinking_Rating    number – 1–10
  Leadership_Potential         string – "Yes" or "No"
  Training_Program             string – e.g. "Basic", "Advanced", "None"
  Professional_Development_Hours number
  Number_Of_Promotions         number
  Annual_Salary_Increase_Percentage number
  Performance_Bonus_Percentage number
  Overtime_Hours_Per_Week      number
  Conflict_Resolution_Cases    number
  Hiring_Source                string – e.g. "LinkedIn", "Referral", "Job Board", "Campus Recruitment"
  Time_to_Hire                 number – days
  Recruitment_Cost             number
  Project_Outcome              string – "Successful", "Failed", or "Ongoing"
  Project_Role                 string – e.g. "Manager", "Developer", "Analyst", "Engineer"
  Project_Complexity           string – "Low", "Medium", "High"
  Project_Size                 string – "Small", "Medium", "Large"
  Mentor_Rating                number – 1–10
  Mentor_Experience_Level      string
  Internship_Conversion_Status string – "Yes" or "No"
  Highest_Education_Level      string
  Innovation_Projects_Involvement string
  Employee_Health_Insurance_Coverage string
  Employee_Stock_Options       string
`;

function isSmallTalk(msg) {
  return /^(hi+|hello|hey|howdy|good\s*(morning|afternoon|evening)|what'?s up|sup|yo|thanks|thank you|ok(ay)?|cool|great|sure|bye|goodbye|who are you|what can you do)[\s!?.]*$/i
    .test(msg.trim());
}

async function generatePipeline(userQuestion, chatHistory, previousError = null) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { maxOutputTokens: 65536, temperature: 0.0 },
  });

  const systemPrompt = `You are a MongoDB aggregation pipeline generator for an HR analytics system.

SCHEMA:
${SCHEMA}

TASK: Generate a MongoDB aggregation pipeline (JSON array) to fetch data that answers the user's question.

STRICT JSON RULES — violations cause a parse error:
- Return ONLY a raw JSON array — NO markdown fences, NO text, NO comments whatsoever
- NO JavaScript comments (no // and no /* */ anywhere in the output)
- ALL property names must be in double quotes: "$group" not $group
- No trailing commas after the last element in any object or array
- Allowed stages: $match $group $sort $limit $project $addFields $unwind $count
- Allowed accumulators: $avg $sum $min $max $first $last $push

SPECIAL RULE FOR "WHY" / "REASON" / "EXPLAIN" QUESTIONS:
- Do NOT try to answer why — instead generate a comparison pipeline that fetches
  the relevant metrics for the groups being compared.
- Example: "Why do Sales resign more than HR?" →
  match Dept in [Sales,HR], group by Dept, compute resignRate, avgOvertime,
  avgEngagement, avgSatisfaction, avgWLB, avgPerf, avgSalaryIncrease.
  The LLM will then use those real numbers to explain the reason.

For resignation rate:
  resignCount: { "$sum": { "$cond": [{ "$eq": ["$Employee_Resignation_Status","Yes"] },1,0] } }
  resignRate:  { "$round": [{ "$multiply": [{ "$divide": ["$resignCount","$total"] },100] },1] }

Round all decimals with { "$round": [value, 1] }
Limit to 15 rows. Sort desc by the main metric.
If absolutely no pipeline is possible, return: []`;

  const history = chatHistory.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });

  const userMsg = previousError
    ? `${systemPrompt}\n\nQuestion: "${userQuestion}"\n\nYour previous pipeline caused this JSON parse error:\n"${previousError}"\n\nCommon causes:\n- You used // or /* */ comments inside the JSON — REMOVE ALL COMMENTS\n- A property name was not in double quotes (e.g. $group instead of "$group")\n- There was a trailing comma\nReturn ONLY the corrected raw JSON array, nothing else.`
    : `${systemPrompt}\n\nGenerate a pipeline for: "${userQuestion}"`;

  const result = await chat.sendMessage(userMsg);

  const raw = result.response.text().trim();
  const clean = raw
    .replace(/```[\w]*\n?/g, '')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,(\s*[}\]])/g, '$1')
    .trim();

  const match = clean.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('LLM returned no JSON array');
  return JSON.parse(match[0]);
}

const ALLOWED_STAGES = new Set([
  '$match', '$group', '$sort', '$limit', '$skip',
  '$project', '$addFields', '$unwind', '$count',
  '$bucket', '$bucketAuto', '$sortByCount',
  '$replaceRoot', '$replaceWith', '$sample',
  '$facet', '$lookup',
]);

function validatePipeline(pipeline, depth = 0) {
  if (!Array.isArray(pipeline)) throw new Error('Pipeline must be an array');
  if (depth > 3) throw new Error('Pipeline nesting too deep');

  for (const stage of pipeline) {
    if (typeof stage !== 'object' || stage === null || Array.isArray(stage))
      throw new Error('Each pipeline stage must be a plain object');

    const keys = Object.keys(stage);
    if (keys.length !== 1) throw new Error(`Stage must have exactly one key, got: ${keys.join(', ')}`);

    const op = keys[0];
    if (!ALLOWED_STAGES.has(op)) {
      throw new Error(`Stage "${op}" is not allowed`);
    }

    if (op === '$lookup' && stage.$lookup.pipeline) {
      validatePipeline(stage.$lookup.pipeline, depth + 1);
    }
    if (op === '$facet') {
      for (const subPipeline of Object.values(stage.$facet)) {
        validatePipeline(subPipeline, depth + 1);
      }
    }
  }
}

async function executePipeline(pipeline) {
  if (!Array.isArray(pipeline) || pipeline.length === 0) return null;
  validatePipeline(pipeline);
  return Employee.aggregate(pipeline).limit(50);
}

// Parse REASONING / ANSWER / VISUALIZATION sections from LLM output
function parseDelimitedResponse(text) {
  const reasoningMatch = text.match(/REASONING:\s*([\s\S]*?)(?=\nANSWER:|$)/i);
  const answerMatch    = text.match(/ANSWER:\s*([\s\S]*?)(?=\nVISUALIZATION:|$)/i);
  const vizMatch       = text.match(/VISUALIZATION:\s*(\{[\s\S]*\})/i);

  const reasoning = reasoningMatch ? reasoningMatch[1].trim() : null;
  const answer    = answerMatch    ? answerMatch[1].trim()    : text.trim();

  let visualization = null;
  if (vizMatch) {
    try {
      const v = JSON.parse(vizMatch[1]);
      if (v.type && v.type !== 'none' && v.data && v.data.length > 0) {
        visualization = v;
      }
    } catch (_) {}
  }

  return { answer, visualization, reasoning };
}

async function analyseResults(userQuestion, results, chatHistory) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { maxOutputTokens: 65536, temperature: 0.2 },
  });

  const history = chatHistory.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  const hasData = results && results.length > 0;
  const dataBlock = hasData
    ? `Actual data from the database:\n${JSON.stringify(results, null, 2)}`
    : 'No database data available — note this limitation clearly in your answer.';

  const prompt = `You are a precise HR data analyst with access to real employee data.

Question: "${userQuestion}"

${dataBlock}

${hasData
  ? 'Use the actual numbers above to give a specific, data-grounded answer. For "why" questions, identify which metrics differ between the groups and use those differences to explain the reason.'
  : 'Answer from general HR knowledge since no data was available. Explicitly state the answer is based on general knowledge, not this organization\'s data.'
}

Respond in EXACTLY this three-section format — no deviations:

REASONING:
[2–4 bullet points using • showing multi-factor analysis: compare metrics across groups, explain causality or correlations, flag edge cases or small samples (< 10 records), highlight surprising patterns or confounders]

ANSWER:
[Your plain-text conclusion. Max 150 words. Use • for bullet points. Cite real numbers from the data.]

VISUALIZATION:
[A single-line JSON object for the best chart, OR {"type":"none"} if no chart fits]

Visualization JSON rules:
- "bar"            → {"type":"bar","title":"...","data":[{"name":"X","value":N},...], "xKey":"name","dataKey":"value"}
- "grouped-bar"    → {"type":"grouped-bar","title":"...","data":[{"name":"X","metric1":N,"metric2":N},...], "xKey":"name","keys":["metric1","metric2"]}
- "horizontal-bar" → {"type":"horizontal-bar","title":"...","data":[{"label":"X","value":N},...], "xKey":"label","dataKey":"value"}
- "line"           → {"type":"line","title":"...","data":[{"name":"X","val":N},...], "xKey":"name","keys":["val"]}
- "table"          → {"type":"table","title":"...","data":[{...},...], "columns":[{"key":"field","label":"Header"},...]}
- "none"           → {"type":"none"}

Pick the best type:
• bar          → single metric per category
• grouped-bar  → 2–3 metrics per category
• horizontal-bar → ranked list by one value
• line         → trend over ordered buckets
• table        → multi-column detail or employee lists
• none         → conceptual/why questions or no numeric data`;

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(prompt);
  const raw = result.response.text();

  return parseDelimitedResponse(raw);
}

async function ragQuery(userQuestion, history = []) {
  if (isSmallTalk(userQuestion)) {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: 'You are a friendly HR data analyst chatbot. Respond naturally to greetings and small talk. Keep it short.',
      generationConfig: { maxOutputTokens: 150, temperature: 0.7 },
    });
    const chatHistory = history.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));
    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(userQuestion);
    const reply = result.response.text();
    return { reply, visualization: null, reasoning: null, pipeline: null, recordCount: null };
  }

  const MAX_ATTEMPTS = 3;
  let results  = null;
  let pipeline = null;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const p = await generatePipeline(userQuestion, history, lastError);
      results  = await executePipeline(p);
      pipeline = p;
      lastError = null;
      break;
    } catch (err) {
      lastError = err.message;
    }
  }

  const recordCount = results ? results.length : 0;
  const { answer, visualization, reasoning } = await analyseResults(userQuestion, results, history);

  return { reply: answer, visualization, reasoning, pipeline, recordCount };
}

module.exports = { ragQuery };
