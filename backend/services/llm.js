const { GoogleGenerativeAI } = require('@google/generative-ai');
const AnalysisCache = require('../models/AnalysisCache');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an expert HR data analyst. You are given ONLY computed statistical summaries — never raw data.
Respond in EXACTLY this markdown format (no deviations):

**REASONING:**
• [Multi-factor analytical step: compare at least 2 variables, explain causality or correlation, note any edge case or small sample if n < 10]
• [Second analytical step: identify the most surprising or counter-intuitive pattern in the data]

**KEY FINDING:** [One crisp sentence stating the most important insight]

**EVIDENCE:**
• [Specific point with a number from the data]
• [Specific point with a number from the data]
• [Specific point with a number from the data]

**RECOMMENDATION:** [1–2 concrete, actionable HR steps based on the evidence]

Rules: Use only the numbers provided. Be direct. No generic advice.`;

async function askGemini(question, dataContext, cacheKey) {
  // Serve from cache to avoid unnecessary API costs
  try {
    const cached = await AnalysisCache.findOne({ key: cacheKey });
    if (cached) return cached.result;
  } catch (_) {}

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { maxOutputTokens: 2048, temperature: 0.3 },
  });

  const prompt = `Question: ${question}\n\nData Summary (use only these numbers):\n${JSON.stringify(dataContext, null, 2)}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    await AnalysisCache.create({ key: cacheKey, result: text });
  } catch (_) {} // ignore duplicate key on race condition

  return text;
}

async function clearCache(keyPattern) {
  if (keyPattern) {
    await AnalysisCache.deleteMany({ key: new RegExp(keyPattern) });
  } else {
    await AnalysisCache.deleteMany({});
  }
}

module.exports = { askGemini, clearCache };
