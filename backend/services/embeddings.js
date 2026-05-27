const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function employeeToText(emp) {
  return [
    `Department: ${emp.Department || 'Unknown'}`,
    `Role: ${emp.Job_Title || 'Unknown'}`,
    `Performance Rating: ${emp.Performance_Rating || 'N/A'}`,
    `Technical Skills: ${emp.Technical_Skills_Rating || 'N/A'}`,
    `Communication Skills: ${emp.Communication_Skills_Rating || 'N/A'}`,
    `Leadership: ${emp.Leadership_Qualities_Rating || 'N/A'}`,
    `Teamwork: ${emp.Teamwork_Skills_Rating || 'N/A'}`,
    `Training Program: ${emp.Training_Program || 'None'}`,
    `Engagement Score: ${emp.Employee_Engagement_Score || 'N/A'}`,
    `Resignation Status: ${emp.Employee_Resignation_Status || 'Unknown'}`,
    `Hiring Source: ${emp.Hiring_Source || 'Unknown'}`,
    `Project Outcome: ${emp.Project_Outcome || 'Unknown'}`,
    `Project Role: ${emp.Project_Role || 'Unknown'}`,
    `Education: ${emp.Highest_Education_Level || 'Unknown'}`,
    `Work Life Balance: ${emp.Employee_Work_Life_Balance_Rating || 'N/A'}`,
    `Overtime Hours/Week: ${emp.Overtime_Hours_Per_Week || 'N/A'}`,
    `Salary Increase %: ${emp.Annual_Salary_Increase_Percentage || 'N/A'}`,
    `Promotions: ${emp.Number_Of_Promotions || 0}`,
  ].join('. ');
}

// Batch embed up to 2048 texts per OpenAI call
async function batchEmbedTexts(texts) {
  const BATCH = 2000;
  const allEmbeddings = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
    });
    response.data
      .sort((a, b) => a.index - b.index)
      .forEach(item => allEmbeddings.push(item.embedding));
  }
  return allEmbeddings;
}

async function getSingleEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.substring(0, 8000),
  });
  return response.data[0].embedding;
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { employeeToText, batchEmbedTexts, getSingleEmbedding, cosineSimilarity };
