const express = require('express');
const router = express.Router();
const ss = require('simple-statistics');
const Employee = require('../../models/Employee');
const { twoGroupDiff, safeNums } = require('../../services/stats');
const { askGemini } = require('../../services/llm');

const ANALYSIS_FIELDS = [
  'Employee_Engagement_Score', 'Overtime_Hours_Per_Week', 'Employee_Work_Life_Balance_Rating',
  'Employee_Job_Satisfaction_Score', 'Annual_Salary_Increase_Percentage', 'Performance_Rating',
  'Technical_Skills_Rating', 'Leadership_Qualities_Rating', 'Professional_Development_Hours',
  'Telecommuting_Days_Per_Week', 'Number_Of_Promotions', 'Performance_Bonus_Percentage',
  'Work_Hours_Per_Week', 'Mentor_Rating', 'Employee_Training_Evaluation_Score',
];

// Q19 — Multi-Variable Resignation Factors → Gemini explains causation
router.get('/q19', async (req, res) => {
  try {
    const [resigned, retained] = await Promise.all([
      Employee.find({ Employee_Resignation_Status: 'Yes' }).lean(),
      Employee.find({ Employee_Resignation_Status: 'No' }).lean(),
    ]);

    const diffs = twoGroupDiff(resigned, retained, ANALYSIS_FIELDS);
    const top10 = diffs.slice(0, 10);

    const summary = {
      resignedCount: resigned.length,
      retainedCount: retained.length,
      resignationRate: +((resigned.length / (resigned.length + retained.length)) * 100).toFixed(1),
      topDifferences: top10.map(d => ({
        feature: d.field,
        resigned: d.groupA,
        retained: d.groupB,
        difference: d.diff,
      })),
    };

    const insight = await askGemini(
      'What are the primary factors driving employee resignation? Identify causal patterns from the statistical differences.',
      summary,
      'attrition_q19'
    );

    const chartData = top10.map(d => ({
      feature: d.field.replace(/Employee_/g, '').replace(/_/g, ' ').slice(0, 24),
      Resigned: d.groupA,
      Retained: d.groupB,
    }));

    res.json({ chartData, insight, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q20 — Resignation Risk Profile → Gemini creates persona
router.get('/q20', async (req, res) => {
  try {
    const [resigned, all] = await Promise.all([
      Employee.find({ Employee_Resignation_Status: 'Yes' }).lean(),
      Employee.find({}).lean(),
    ]);

    const profileFields = [
      'Employee_Engagement_Score', 'Overtime_Hours_Per_Week', 'Employee_Work_Life_Balance_Rating',
      'Employee_Job_Satisfaction_Score', 'Annual_Salary_Increase_Percentage',
      'Performance_Rating', 'Professional_Development_Hours',
    ];

    const profile = {};
    const allProfile = {};
    for (const f of profileFields) {
      const rVals = safeNums(resigned, f);
      const aVals = safeNums(all, f);
      profile[f] = rVals.length ? +ss.mean(rVals).toFixed(2) : 0;
      allProfile[f] = aVals.length ? +ss.mean(aVals).toFixed(2) : 0;
    }

    // Training distribution
    const trainingDist = {};
    for (const e of resigned) {
      const tp = e.Training_Program || 'None';
      trainingDist[tp] = (trainingDist[tp] || 0) + 1;
    }

    const summary = {
      resignedCount: resigned.length,
      avgProfile: profile,
      allEmployeesAvg: allProfile,
      trainingDistribution: trainingDist,
    };

    const insight = await askGemini(
      'Create a detailed risk profile description — what does a typical at-risk employee look like? What early warning signs should HR watch for?',
      summary,
      'attrition_q20'
    );

    const chartData = profileFields.map(f => ({
      feature: f.replace(/Employee_/g, '').replace(/_/g, ' ').slice(0, 20),
      'At-Risk Profile': profile[f],
      'All Employees': allProfile[f],
    }));

    res.json({ chartData, insight, profile, allProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q21 — Work-Life Balance Comparison (pure stats)
router.get('/q21', async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      Employee_Resignation_Status: 1, Employee_Work_Life_Balance_Rating: 1,
      Overtime_Hours_Per_Week: 1, Employee_Engagement_Score: 1,
      Telecommuting_Days_Per_Week: 1,
    }).lean();

    const resigned = employees.filter(e => e.Employee_Resignation_Status === 'Yes');
    const retained = employees.filter(e => e.Employee_Resignation_Status === 'No');

    const metrics = [
      { key: 'Employee_Work_Life_Balance_Rating', label: 'Work-Life Balance' },
      { key: 'Overtime_Hours_Per_Week', label: 'Overtime Hours/Wk' },
      { key: 'Employee_Engagement_Score', label: 'Engagement Score' },
      { key: 'Telecommuting_Days_Per_Week', label: 'Remote Days/Wk' },
    ];

    const chartData = metrics.map(m => {
      const rVals = safeNums(resigned, m.key);
      const tVals = safeNums(retained, m.key);
      return {
        metric: m.label,
        Resigned: rVals.length ? +ss.mean(rVals).toFixed(2) : 0,
        Retained: tVals.length ? +ss.mean(tVals).toFixed(2) : 0,
      };
    });

    res.json({
      chartData,
      counts: { resigned: resigned.length, retained: retained.length },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
