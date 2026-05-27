const express = require('express');
const router = express.Router();
const ss = require('simple-statistics');
const Employee = require('../../models/Employee');
const { safeNums } = require('../../services/stats');

// Q25 — Hiring Source Effectiveness (pure stats)
router.get('/q25', async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      Hiring_Source: 1, Performance_Rating: 1, Employee_Job_Satisfaction_Score: 1,
      Employee_Resignation_Status: 1, Time_to_Hire: 1, Recruitment_Cost: 1,
    }).lean();

    const sources = [...new Set(employees.map(e => e.Hiring_Source).filter(Boolean))];

    const chartData = sources.map(source => {
      const group = employees.filter(e => e.Hiring_Source === source);
      const perfVals = safeNums(group, 'Performance_Rating');
      const satVals = safeNums(group, 'Employee_Job_Satisfaction_Score');
      const timeVals = safeNums(group, 'Time_to_Hire');
      const costVals = safeNums(group, 'Recruitment_Cost');
      const resigned = group.filter(e => e.Employee_Resignation_Status === 'Yes').length;

      return {
        source,
        count: group.length,
        avgPerformance: perfVals.length ? +ss.mean(perfVals).toFixed(2) : 0,
        avgSatisfaction: satVals.length ? +ss.mean(satVals).toFixed(2) : 0,
        resignationRate: group.length ? +((resigned / group.length) * 100).toFixed(1) : 0,
        avgTimeToHire: timeVals.length ? +ss.mean(timeVals).toFixed(1) : 0,
        avgCost: costVals.length ? +ss.mean(costVals).toFixed(0) : 0,
      };
    }).sort((a, b) => b.avgPerformance - a.avgPerformance);

    // Radar data for top 5 sources (normalised 0-100)
    const top5 = chartData.slice(0, 5);
    const maxPerf = Math.max(...top5.map(s => s.avgPerformance));
    const maxSat = Math.max(...top5.map(s => s.avgSatisfaction));
    const maxRetention = 100;

    const radarData = [
      { metric: 'Avg Performance', ...Object.fromEntries(top5.map(s => [s.source, s.avgPerformance])) },
      { metric: 'Satisfaction', ...Object.fromEntries(top5.map(s => [s.source, s.avgSatisfaction])) },
      { metric: 'Retention Rate', ...Object.fromEntries(top5.map(s => [s.source, +(100 - s.resignationRate).toFixed(1)])) },
    ];

    res.json({ chartData, radarData, sources: top5.map(s => s.source) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
