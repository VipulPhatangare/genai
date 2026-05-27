const express = require('express');
const router = express.Router();
const ss = require('simple-statistics');
const Employee = require('../../models/Employee');
const { pearson, groupMeans, topPercentile, safeNums } = require('../../services/stats');
const { askGemini } = require('../../services/llm');

const SKILL_FIELDS = [
  'Technical_Skills_Rating', 'Communication_Skills_Rating', 'Problem_Solving_Skills_Rating',
  'Leadership_Qualities_Rating', 'Teamwork_Skills_Rating', 'Initiative_Rating',
  'Adaptability_Rating', 'Creativity_Rating',
];

// Q1 — Weighted Scoring Model (pure stats, no LLM)
router.get('/q1', async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      Technical_Skills_Rating: 1, Communication_Skills_Rating: 1,
      Problem_Solving_Skills_Rating: 1, Performance_Rating: 1,
    }).lean();

    const skills = [
      { key: 'Technical_Skills_Rating', label: 'Technical' },
      { key: 'Communication_Skills_Rating', label: 'Communication' },
      { key: 'Problem_Solving_Skills_Rating', label: 'Problem Solving' },
    ];

    const correlations = skills.map(s => ({
      ...s,
      correlation: pearson(employees, s.key, 'Performance_Rating'),
    }));

    const total = correlations.reduce((s, c) => s + Math.abs(c.correlation), 0);
    const chartData = correlations.map(c => ({
      name: c.label,
      correlation: c.correlation,
      weight: total > 0 ? +(Math.abs(c.correlation) / total).toFixed(3) : 0,
      weightPct: total > 0 ? Math.round((Math.abs(c.correlation) / total) * 100) : 0,
    }));

    const formula = chartData
      .sort((a, b) => b.weight - a.weight)
      .map(c => `${c.weightPct}% × ${c.name}`)
      .join(' + ');

    res.json({ chartData, formula, totalEmployees: employees.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q2 — High Performance + Low Leadership → Gemini explains WHY
router.get('/q2', async (req, res) => {
  try {
    const employees = await Employee.find({
      Performance_Rating: { $gte: 10 },
      Leadership_Potential: { $regex: /low/i },
    }).lean();

    const byDept = {};
    const byRole = {};
    const trainingDist = { Basic: 0, Advanced: 0, None: 0 };
    const mentorRatings = [];

    for (const e of employees) {
      byDept[e.Department] = (byDept[e.Department] || 0) + 1;
      byRole[e.Job_Title] = (byRole[e.Job_Title] || 0) + 1;
      const tp = e.Training_Program || 'None';
      trainingDist[tp] = (trainingDist[tp] || 0) + 1;
      if (e.Mentor_Rating) mentorRatings.push(+e.Mentor_Rating);
    }

    const summary = {
      count: employees.length,
      topDepartments: Object.entries(byDept).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topRoles: Object.entries(byRole).sort((a, b) => b[1] - a[1]).slice(0, 4),
      trainingDistribution: trainingDist,
      avgMentorRating: mentorRatings.length ? +ss.mean(mentorRatings).toFixed(2) : 0,
    };

    const insight = await askGemini(
      'Why do these high-performing employees show low leadership potential? What contextual patterns explain this?',
      summary,
      'performance_q2'
    );

    const chartData = Object.entries(byDept)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({ chartData, insight, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q3 — High vs Low Performer Behavioral Patterns (pure stats)
router.get('/q3', async (req, res) => {
  try {
    const [high, low] = await Promise.all([
      Employee.find({ Performance_Rating: { $gte: 10 } }).lean(),
      Employee.find({ Performance_Rating: { $lte: 5 } }).lean(),
    ]);

    const chartData = SKILL_FIELDS.map(field => {
      const hVals = safeNums(high, field);
      const lVals = safeNums(low, field);
      return {
        skill: field.replace('_Skills_Rating', '').replace('_Rating', '').replace(/_/g, ' '),
        High: hVals.length ? +ss.mean(hVals).toFixed(2) : 0,
        Low: lVals.length ? +ss.mean(lVals).toFixed(2) : 0,
      };
    });

    res.json({ chartData, counts: { high: high.length, low: low.length } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q4 — Skill–Outcome Inconsistency → Gemini explains anomalies
router.get('/q4', async (req, res) => {
  try {
    const failed = await Employee.find({ Project_Outcome: 'Failed' }).lean();

    const highSkillFailed = failed.filter(e => {
      const vals = SKILL_FIELDS.slice(0, 5).map(f => +e[f]).filter(v => !isNaN(v));
      return vals.length && ss.mean(vals) > 12;
    });

    const complexDist = {};
    let totalOvertime = 0;
    for (const e of highSkillFailed) {
      const c = e.Project_Complexity || 'Unknown';
      complexDist[c] = (complexDist[c] || 0) + 1;
      totalOvertime += +e.Overtime_Hours_Per_Week || 0;
    }

    const avgSkill = highSkillFailed.length
      ? +ss.mean(
          highSkillFailed.map(e => {
            const vals = SKILL_FIELDS.slice(0, 5).map(f => +e[f]).filter(v => !isNaN(v));
            return ss.mean(vals);
          })
        ).toFixed(2)
      : 0;

    const summary = {
      highSkillFailedCount: highSkillFailed.length,
      totalFailedProjects: failed.length,
      percentOfFailed: failed.length ? Math.round((highSkillFailed.length / failed.length) * 100) : 0,
      complexityBreakdown: complexDist,
      avgSkillScore: avgSkill,
      avgOvertimeHours: highSkillFailed.length
        ? +(totalOvertime / highSkillFailed.length).toFixed(1)
        : 0,
    };

    const insight = await askGemini(
      'Why do high-skilled employees have failed projects? Identify the anomaly and explain root causes.',
      summary,
      'performance_q4'
    );

    const chartData = Object.entries(complexDist).map(([name, count]) => ({ name, count }));
    res.json({ chartData, insight, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q5 — Ideal Employee Profile (pure stats, radar chart)
router.get('/q5', async (req, res) => {
  try {
    const all = await Employee.find({}).lean();
    const top = topPercentile(all, 'Performance_Rating', 10);

    const chartData = SKILL_FIELDS.map(field => {
      const topVals = safeNums(top, field);
      const allVals = safeNums(all, field);
      return {
        skill: field.replace('_Skills_Rating', '').replace('_Rating', '').replace(/_/g, ' '),
        'Top 10%': topVals.length ? +ss.mean(topVals).toFixed(2) : 0,
        'All Employees': allVals.length ? +ss.mean(allVals).toFixed(2) : 0,
      };
    });

    const extras = {
      count: top.length,
      avgPerformance: +ss.mean(safeNums(top, 'Performance_Rating')).toFixed(2),
      avgDevHours: safeNums(top, 'Professional_Development_Hours').length
        ? +ss.mean(safeNums(top, 'Professional_Development_Hours')).toFixed(1)
        : 0,
      avgEngagement: safeNums(top, 'Employee_Engagement_Score').length
        ? +ss.mean(safeNums(top, 'Employee_Engagement_Score')).toFixed(1)
        : 0,
      resignationRate:
        top.length > 0
          ? +((top.filter(e => e.Employee_Resignation_Status === 'Yes').length / top.length) * 100).toFixed(1)
          : 0,
    };

    res.json({ chartData, extras });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
