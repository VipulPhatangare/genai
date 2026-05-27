const express = require('express');
const router = express.Router();
const ss = require('simple-statistics');
const Employee = require('../../models/Employee');
const { pearson, safeNums, groupMeans } = require('../../services/stats');

// Q22 — Salary & Bonus vs Performance (pure stats)
router.get('/q22', async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      Performance_Rating: 1, Annual_Salary_Increase_Percentage: 1,
      Performance_Bonus_Percentage: 1,
    }).lean();

    const corrSalaryPerf = pearson(employees, 'Annual_Salary_Increase_Percentage', 'Performance_Rating');
    const corrBonusPerf = pearson(employees, 'Performance_Bonus_Percentage', 'Performance_Rating');

    // Scatter data (sample)
    const scatterSalary = employees
      .filter(e => e.Performance_Rating != null && e.Annual_Salary_Increase_Percentage != null)
      .slice(0, 500)
      .map(e => ({
        x: +e.Performance_Rating,
        y: +e.Annual_Salary_Increase_Percentage,
      }));

    const scatterBonus = employees
      .filter(e => e.Performance_Rating != null && e.Performance_Bonus_Percentage != null)
      .slice(0, 500)
      .map(e => ({
        x: +e.Performance_Rating,
        y: +e.Performance_Bonus_Percentage,
      }));

    // Performance buckets vs avg salary increase
    const buckets = [
      { label: 'Low (≤5)', filter: e => +e.Performance_Rating <= 5 },
      { label: 'Mid (6-9)', filter: e => +e.Performance_Rating >= 6 && +e.Performance_Rating <= 9 },
      { label: 'High (≥10)', filter: e => +e.Performance_Rating >= 10 },
    ];
    const chartData = buckets.map(b => {
      const group = employees.filter(b.filter);
      const salaryVals = safeNums(group, 'Annual_Salary_Increase_Percentage');
      const bonusVals = safeNums(group, 'Performance_Bonus_Percentage');
      return {
        group: b.label,
        'Avg Salary Increase %': salaryVals.length ? +ss.mean(salaryVals).toFixed(2) : 0,
        'Avg Bonus %': bonusVals.length ? +ss.mean(bonusVals).toFixed(2) : 0,
        count: group.length,
      };
    });

    res.json({
      chartData,
      scatterSalary,
      scatterBonus,
      correlations: {
        salaryVsPerformance: corrSalaryPerf,
        bonusVsPerformance: corrBonusPerf,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q23 — Underpaid Employees (pure stats)
router.get('/q23', async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      Employee_ID: 1, Department: 1, Job_Title: 1,
      Performance_Rating: 1, Annual_Salary_Increase_Percentage: 1,
      Employee_Engagement_Score: 1, Employee_Resignation_Status: 1,
    }).lean();

    const perfVals = safeNums(employees, 'Performance_Rating');
    const salaryVals = safeNums(employees, 'Annual_Salary_Increase_Percentage');

    if (!perfVals.length || !salaryVals.length) {
      return res.json({ underpaid: [], chartData: [], stats: {} });
    }

    const perfMean = ss.mean(perfVals);
    const perfStd = ss.standardDeviation(perfVals);
    const salaryMean = ss.mean(salaryVals);
    const salaryStd = ss.standardDeviation(salaryVals);

    const underpaid = employees.filter(e => {
      const p = +e.Performance_Rating;
      const s = +e.Annual_Salary_Increase_Percentage;
      return !isNaN(p) && !isNaN(s) &&
        p >= perfMean + perfStd &&
        s <= salaryMean - salaryStd;
    });

    const byDept = {};
    for (const e of underpaid) {
      byDept[e.Department] = (byDept[e.Department] || 0) + 1;
    }

    const chartData = Object.entries(byDept)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      underpaid: underpaid.slice(0, 50).map(e => ({
        id: e.Employee_ID,
        department: e.Department,
        role: e.Job_Title,
        performance: e.Performance_Rating,
        salaryIncrease: e.Annual_Salary_Increase_Percentage,
        resigned: e.Employee_Resignation_Status,
      })),
      chartData,
      stats: {
        totalUnderpaid: underpaid.length,
        pctResigned: underpaid.length
          ? +((underpaid.filter(e => e.Employee_Resignation_Status === 'Yes').length / underpaid.length) * 100).toFixed(1)
          : 0,
        perfThreshold: +(perfMean + perfStd).toFixed(2),
        salaryThreshold: +(salaryMean - salaryStd).toFixed(2),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q24 — Benefits vs Retention (pure stats)
router.get('/q24', async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      Employee_Stock_Options: 1, Employee_Health_Insurance_Coverage: 1,
      Employee_Savings_Plans: 1, Employee_Resignation_Status: 1,
      Employee_Job_Satisfaction_Score: 1,
    }).lean();

    const benefitFields = [
      { key: 'Employee_Stock_Options', label: 'Stock Options' },
      { key: 'Employee_Health_Insurance_Coverage', label: 'Health Insurance' },
      { key: 'Employee_Savings_Plans', label: 'Savings Plans' },
    ];

    const chartData = [];
    for (const bf of benefitFields) {
      const tiers = [...new Set(employees.map(e => e[bf.key]).filter(v => v && v !== 'None' && v !== 'null'))];
      for (const tier of tiers) {
        const group = employees.filter(e => e[bf.key] === tier);
        const resigned = group.filter(e => e.Employee_Resignation_Status === 'Yes').length;
        const satVals = safeNums(group, 'Employee_Job_Satisfaction_Score');
        chartData.push({
          benefit: bf.label,
          tier,
          resignationRate: group.length ? +((resigned / group.length) * 100).toFixed(1) : 0,
          avgSatisfaction: satVals.length ? +ss.mean(satVals).toFixed(2) : 0,
          count: group.length,
        });
      }
    }

    res.json({ chartData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
