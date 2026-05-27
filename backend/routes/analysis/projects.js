const express = require('express');
const router = express.Router();
const ss = require('simple-statistics');
const Employee = require('../../models/Employee');
const { pearson, groupMeans, safeNums } = require('../../services/stats');

const SKILL_FIELDS = [
  'Technical_Skills_Rating', 'Communication_Skills_Rating', 'Problem_Solving_Skills_Rating',
  'Leadership_Qualities_Rating', 'Teamwork_Skills_Rating', 'Initiative_Rating',
  'Adaptability_Rating', 'Creativity_Rating',
];

// Q15 — Project Complexity × Size → Success Rate heatmap (pure stats)
router.get('/q15', async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      Project_Complexity: 1, Project_Size: 1, Project_Outcome: 1,
    }).lean();

    const complexities = ['Simple', 'Moderate', 'Complex'];
    const sizes = ['Small', 'Medium', 'Large'];

    const heatmapData = [];
    for (const complexity of complexities) {
      for (const size of sizes) {
        const group = employees.filter(
          e => e.Project_Complexity === complexity && e.Project_Size === size
        );
        const successful = group.filter(e => e.Project_Outcome === 'Successful').length;
        heatmapData.push({
          complexity,
          size,
          total: group.length,
          successful,
          successRate: group.length ? +((successful / group.length) * 100).toFixed(1) : 0,
        });
      }
    }

    // Also as grouped bar
    const barData = complexities.map(c => {
      const obj = { complexity: c };
      for (const s of sizes) {
        const cell = heatmapData.find(h => h.complexity === c && h.size === s);
        obj[s] = cell?.successRate || 0;
      }
      return obj;
    });

    res.json({ heatmapData, barData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q16 — Successful vs Failed Employee Patterns (pure stats)
router.get('/q16', async (req, res) => {
  try {
    const [successful, failed] = await Promise.all([
      Employee.find({ Project_Outcome: 'Successful' }).lean(),
      Employee.find({ Project_Outcome: 'Failed' }).lean(),
    ]);

    const chartData = SKILL_FIELDS.map(field => {
      const sVals = safeNums(successful, field);
      const fVals = safeNums(failed, field);
      return {
        skill: field.replace('_Skills_Rating', '').replace('_Rating', '').replace(/_/g, ' '),
        Successful: sVals.length ? +ss.mean(sVals).toFixed(2) : 0,
        Failed: fVals.length ? +ss.mean(fVals).toFixed(2) : 0,
      };
    });

    // Training distribution
    const trainingComp = ['Basic', 'Advanced', 'None'].map(tp => {
      const sCount = successful.filter(e => e.Training_Program === tp).length;
      const fCount = failed.filter(e => e.Training_Program === tp).length;
      return {
        name: tp,
        Successful: successful.length ? Math.round((sCount / successful.length) * 100) : 0,
        Failed: failed.length ? Math.round((fCount / failed.length) * 100) : 0,
      };
    });

    res.json({
      chartData,
      trainingComparison: trainingComp,
      counts: { successful: successful.length, failed: failed.length },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q17 — Feature Importance for Project Success (pure stats)
router.get('/q17', async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      Project_Outcome: 1,
      Technical_Skills_Rating: 1, Communication_Skills_Rating: 1,
      Problem_Solving_Skills_Rating: 1, Leadership_Qualities_Rating: 1,
      Teamwork_Skills_Rating: 1, Initiative_Rating: 1,
      Adaptability_Rating: 1, Creativity_Rating: 1,
      Performance_Rating: 1, Professional_Development_Hours: 1,
    }).lean();

    const withBinary = employees
      .filter(e => e.Project_Outcome === 'Successful' || e.Project_Outcome === 'Failed')
      .map(e => ({ ...e, success: e.Project_Outcome === 'Successful' ? 1 : 0 }));

    const features = [...SKILL_FIELDS, 'Performance_Rating', 'Professional_Development_Hours'];
    const chartData = features
      .map(field => ({
        feature: field.replace('_Skills_Rating', '').replace('_Rating', '').replace(/_/g, ' '),
        correlation: Math.abs(pearson(withBinary, field, 'success')),
      }))
      .sort((a, b) => b.correlation - a.correlation);

    res.json({ chartData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q18 — Performance by Project Role (pure stats)
router.get('/q18', async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      Project_Role: 1, Performance_Rating: 1,
      Annual_Salary_Increase_Percentage: 1, Employee_Resignation_Status: 1,
    }).lean();

    const roles = [...new Set(employees.map(e => e.Project_Role).filter(Boolean))];

    const chartData = roles.map(role => {
      const group = employees.filter(e => e.Project_Role === role);
      const perfVals = safeNums(group, 'Performance_Rating').sort((a, b) => a - b);
      const resigned = group.filter(e => e.Employee_Resignation_Status === 'Yes').length;
      return {
        role,
        count: group.length,
        min: perfVals.length ? perfVals[0] : 0,
        q1: perfVals.length ? ss.quantile(perfVals, 0.25) : 0,
        median: perfVals.length ? ss.median(perfVals) : 0,
        q3: perfVals.length ? ss.quantile(perfVals, 0.75) : 0,
        max: perfVals.length ? perfVals[perfVals.length - 1] : 0,
        mean: perfVals.length ? +ss.mean(perfVals).toFixed(2) : 0,
        resignationRate: group.length ? +((resigned / group.length) * 100).toFixed(1) : 0,
      };
    });

    res.json({ chartData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
