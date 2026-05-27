const express = require('express');
const router = express.Router();
const ss = require('simple-statistics');
const Employee = require('../../models/Employee');
const { pearson, groupMeans, safeNums } = require('../../services/stats');
const { askGemini } = require('../../services/llm');

// Q6 — Dev Hours vs Performance & Promotions (pure stats)
router.get('/q6', async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      Training_Program: 1, Professional_Development_Hours: 1,
      Performance_Rating: 1, Number_Of_Promotions: 1,
    }).lean();

    const corrHoursPerf = pearson(employees, 'Professional_Development_Hours', 'Performance_Rating');
    const corrHoursPromo = pearson(employees, 'Professional_Development_Hours', 'Number_Of_Promotions');

    const chartData = groupMeans(
      employees,
      'Training_Program',
      ['Professional_Development_Hours', 'Performance_Rating', 'Number_Of_Promotions']
    ).filter(g => g.group && g.group !== 'null');

    res.json({
      chartData,
      correlations: {
        hoursVsPerformance: corrHoursPerf,
        hoursVsPromotions: corrHoursPromo,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q7 — Mentor Impact → Gemini explains
router.get('/q7', async (req, res) => {
  try {
    const employees = await Employee.find({
      Mentor_ID: { $nin: [null, 'N/A'] },
    }).lean();

    const byExpLevel = groupMeans(employees, 'Mentor_Experience_Level', ['Performance_Rating']);
    const convByLevel = {};
    const groupCounts = {};
    for (const e of employees) {
      const lvl = e.Mentor_Experience_Level || 'Unknown';
      if (!convByLevel[lvl]) { convByLevel[lvl] = 0; groupCounts[lvl] = 0; }
      groupCounts[lvl]++;
      if (e.Internship_Conversion_Status === 'Converted') convByLevel[lvl]++;
    }

    const chartData = byExpLevel.map(g => ({
      ...g,
      conversionRate: groupCounts[g.group]
        ? +((convByLevel[g.group] || 0) / groupCounts[g.group] * 100).toFixed(1)
        : 0,
    })).filter(g => g.group !== 'null');

    // Bucket mentor ratings
    const buckets = { 'Low (1-4)': [], 'Mid (5-7)': [], 'High (8-10)': [] };
    for (const e of employees) {
      const r = +e.Mentor_Rating;
      if (!isNaN(r)) {
        const b = r <= 4 ? 'Low (1-4)' : r <= 7 ? 'Mid (5-7)' : 'High (8-10)';
        buckets[b].push(e);
      }
    }
    const ratingChartData = Object.entries(buckets).map(([bucket, emps]) => {
      const perfVals = safeNums(emps, 'Performance_Rating');
      const conv = emps.filter(e => e.Internship_Conversion_Status === 'Converted').length;
      return {
        bucket,
        avgPerformance: perfVals.length ? +ss.mean(perfVals).toFixed(2) : 0,
        conversionRate: emps.length ? +((conv / emps.length) * 100).toFixed(1) : 0,
        count: emps.length,
      };
    });

    const summary = {
      totalMentored: employees.length,
      byExperienceLevel: chartData,
      byRatingBucket: ratingChartData,
    };

    const insight = await askGemini(
      'How does mentor quality (experience level and rating) impact employee performance and internship conversion rates?',
      summary,
      'training_q7'
    );

    res.json({ chartData, ratingChartData, insight });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q8 — Trained but Low Performance → Gemini generates hypotheses
router.get('/q8', async (req, res) => {
  try {
    const employees = await Employee.find({
      Training_Program: { $nin: [null, 'None'] },
      Performance_Rating: { $lte: 5 },
    }).lean();

    const byDept = {};
    let noMentor = 0;
    let highOvertime = 0;
    for (const e of employees) {
      byDept[e.Department] = (byDept[e.Department] || 0) + 1;
      if (!e.Mentor_ID || e.Mentor_ID === 'N/A') noMentor++;
      if (+e.Overtime_Hours_Per_Week > 10) highOvertime++;
    }

    const summary = {
      count: employees.length,
      pctNoMentor: employees.length ? Math.round((noMentor / employees.length) * 100) : 0,
      pctHighOvertime: employees.length ? Math.round((highOvertime / employees.length) * 100) : 0,
      byDepartment: Object.entries(byDept).sort((a, b) => b[1] - a[1]).slice(0, 5),
      trainingTypes: groupMeans(employees, 'Training_Program', ['Performance_Rating']),
    };

    const insight = await askGemini(
      'Generate 4-5 hypotheses for why employees who received training still show low performance (≤5).',
      summary,
      'training_q8'
    );

    const chartData = Object.entries(byDept)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({ chartData, insight, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q9 — Basic vs Advanced Training Effectiveness (pure stats)
router.get('/q9', async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      Training_Program: 1, Performance_Rating: 1, Number_Of_Promotions: 1,
    }).lean();

    const chartData = groupMeans(
      employees,
      'Training_Program',
      ['Performance_Rating', 'Number_Of_Promotions']
    )
      .filter(g => g.group && g.group !== 'null')
      .sort((a, b) => b.Performance_Rating - a.Performance_Rating);

    res.json({ chartData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q10 — Who Benefits Most from Advanced Training? → Gemini predicts
router.get('/q10', async (req, res) => {
  try {
    const midPerformers = await Employee.find({
      Performance_Rating: { $gte: 6, $lte: 9 },
      Training_Program: { $ne: 'Advanced' },
    }).lean();

    // Sample 15 profiles for Gemini reasoning
    const sample = midPerformers
      .sort(() => 0.5 - Math.random())
      .slice(0, 15)
      .map(e => ({
        department: e.Department,
        role: e.Job_Title,
        performance: e.Performance_Rating,
        devHours: e.Professional_Development_Hours,
        mentorAvailability: e.Mentor_Availability_Hours_Per_Week,
        education: e.Highest_Education_Level,
        certifications: e.Certifications,
        careerGoalsSet: e.Career_Goals_Set,
        currentTraining: e.Training_Program,
      }));

    const summary = {
      totalMidPerformers: midPerformers.length,
      sampleProfiles: sample,
    };

    const insight = await askGemini(
      'Based on these mid-level employee profiles, predict which types of employees would benefit MOST from advanced training. Identify 3-4 key characteristics.',
      summary,
      'training_q10'
    );

    const chartData = groupMeans(
      midPerformers,
      'Department',
      ['Performance_Rating', 'Professional_Development_Hours']
    ).sort((a, b) => b.count - a.count).slice(0, 8);

    res.json({ chartData, insight, totalMidPerformers: midPerformers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
