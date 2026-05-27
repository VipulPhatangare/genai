const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csvtojson');
const path = require('path');
const fs = require('fs');
const Employee = require('../models/Employee');

const upload = multer({ dest: path.join(__dirname, '../uploads/') });

function toNum(v) {
  if (v === null || v === undefined || v === '' || v === 'N/A' || v === 'None') return null;
  const n = +v;
  return isNaN(n) ? null : n;
}

function toDate(v) {
  if (!v || v === 'N/A') return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function cleanDoc(raw) {
  const doc = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = k.trim().replace(/\s+/g, '_'); // handle "Future Date" → "Future_Date"
    const val = typeof v === 'string' ? v.trim() : v;
    doc[key] = val === 'N/A' || val === '' ? null : val;
  }

  // Parse numeric fields
  const numericFields = [
    'Performance_Rating', 'Bonus', 'Professional_Development_Hours', 'Number_Of_Promotions',
    'Annual_Salary_Increase_Percentage', 'Performance_Bonus_Percentage',
    'Work_Hours_Per_Week', 'Telecommuting_Days_Per_Week', 'Overtime_Hours_Per_Week',
    'Conflict_Resolution_Cases', 'Customer_Complaints_Handled',
    'Leadership_Qualities_Rating', 'Technical_Skills_Rating', 'Communication_Skills_Rating',
    'Problem_Solving_Skills_Rating', 'Teamwork_Skills_Rating', 'Initiative_Rating',
    'Adaptability_Rating', 'Creativity_Rating', 'Strategic_Thinking_Rating',
    'Employee_Engagement_Score', 'Feedback_From_Colleagues', 'Feedback_From_Supervisors',
    'Peer_Reviews', 'Customer_Feedback', 'Time_to_Hire', 'Hiring_Manager_Satisfaction',
    'Recruitment_Cost', 'Mentor_Rating', 'Mentor_Availability_Hours_Per_Week',
    'Internship_Evaluation_Score', 'Employee_Work_Life_Balance_Rating',
    'Employee_Job_Satisfaction_Score', 'Employee_Training_Cost',
    'Employee_Training_Evaluation_Score', 'Employee_Training_Participation_Rate',
    'Employee_Annual_Salary_Adjustment',
  ];
  for (const f of numericFields) {
    if (doc[f] !== undefined) doc[f] = toNum(doc[f]);
  }

  // Parse dates
  doc.Hire_Date = toDate(doc.Hire_Date);
  doc.Onboarding_Date = toDate(doc.Onboarding_Date);
  doc.First_Project_Start_Date = toDate(doc.First_Project_Start_Date);

  // Derived field
  const perf = doc.Performance_Rating;
  doc.performance_group = perf <= 5 ? 'Low' : perf <= 9 ? 'Mid' : 'High';

  return doc;
}

// POST /api/data/upload — ingest CSV into MongoDB
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const rows = await csv().fromFile(req.file.path);
    fs.unlinkSync(req.file.path); // cleanup temp file

    const docs = rows.map(cleanDoc);

    await Employee.deleteMany({}); // clear previous data
    await Employee.insertMany(docs, { ordered: false });

    res.json({ message: 'Upload successful', count: docs.length });
  } catch (err) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/data/status — quick stats about loaded data
router.get('/status', async (req, res) => {
  try {
    const [total, deptCounts] = await Promise.all([
      Employee.countDocuments(),
      Employee.aggregate([{ $group: { _id: '$Department', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ]);
    res.json({ total, departments: deptCounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/data/clear-cache — bust LLM cache
router.delete('/clear-cache', async (req, res) => {
  const { clearCache } = require('../services/llm');
  await clearCache();
  res.json({ message: 'Cache cleared' });
});

module.exports = router;
