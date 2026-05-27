const express = require('express');
const router = express.Router();
const ss = require('simple-statistics');
const Employee = require('../../models/Employee');
const { pearson, percentileValue, safeNums, kmeans } = require('../../services/stats');
const { askGemini } = require('../../services/llm');

const SOFT_SKILL_FIELDS = [
  'Leadership_Qualities_Rating', 'Teamwork_Skills_Rating',
  'Adaptability_Rating', 'Creativity_Rating',
];
const SOFT_SKILL_LABELS = ['Leadership', 'Teamwork', 'Adaptability', 'Creativity'];

// Q11 — Soft Skills Clustering → Gemini names archetypes
router.get('/q11', async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      Leadership_Qualities_Rating: 1, Teamwork_Skills_Rating: 1,
      Adaptability_Rating: 1, Creativity_Rating: 1,
      Department: 1, Job_Title: 1,
    }).lean();

    const valid = employees.filter(e =>
      SOFT_SKILL_FIELDS.every(f => e[f] != null && !isNaN(+e[f]))
    );

    const points = valid.map(e => SOFT_SKILL_FIELDS.map(f => +e[f]));
    const { assignments, centroids } = kmeans(points, 4);

    // Count cluster sizes and compute dept distribution
    const clusterData = centroids.map((c, idx) => {
      const members = valid.filter((_, i) => assignments[i] === idx);
      const depts = {};
      members.forEach(e => { depts[e.Department] = (depts[e.Department] || 0) + 1; });
      return {
        cluster: `Cluster ${idx + 1}`,
        size: members.length,
        Leadership: c[0],
        Teamwork: c[1],
        Adaptability: c[2],
        Creativity: c[3],
        topDept: Object.entries(depts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
      };
    });

    const summary = {
      totalClustered: valid.length,
      clusterCenters: clusterData.map(c => ({
        cluster: c.cluster,
        size: c.size,
        Leadership: c.Leadership,
        Teamwork: c.Teamwork,
        Adaptability: c.Adaptability,
        Creativity: c.Creativity,
      })),
    };

    const insight = await askGemini(
      'Name each cluster as a meaningful employee archetype and describe their strengths and development needs.',
      summary,
      'behavioral_q11'
    );

    res.json({ chartData: clusterData, insight });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q12 — High Conflict, Low Teamwork → Gemini explains contradiction
router.get('/q12', async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      Conflict_Resolution_Cases: 1, Teamwork_Skills_Rating: 1,
      Department: 1, Job_Title: 1, Leadership_Qualities_Rating: 1,
    }).lean();

    const conflictP50 = percentileValue(employees, 'Conflict_Resolution_Cases', 50);
    const teamworkP50 = percentileValue(employees, 'Teamwork_Skills_Rating', 50);

    const contradictors = employees.filter(e =>
      +e.Conflict_Resolution_Cases > conflictP50 &&
      +e.Teamwork_Skills_Rating < teamworkP50
    );

    const byRole = {};
    for (const e of contradictors) {
      byRole[e.Job_Title] = (byRole[e.Job_Title] || 0) + 1;
    }

    const summary = {
      count: contradictors.length,
      pctOfAll: employees.length ? Math.round((contradictors.length / employees.length) * 100) : 0,
      medianConflictCases: conflictP50,
      medianTeamworkScore: teamworkP50,
      avgLeadershipInGroup: safeNums(contradictors, 'Leadership_Qualities_Rating').length
        ? +ss.mean(safeNums(contradictors, 'Leadership_Qualities_Rating')).toFixed(2)
        : 0,
      topRoles: Object.entries(byRole).sort((a, b) => b[1] - a[1]).slice(0, 5),
    };

    const insight = await askGemini(
      'How can employees have high conflict resolution scores but low teamwork scores? Explain this apparent contradiction.',
      summary,
      'behavioral_q12'
    );

    const chartData = Object.entries(byRole)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Scatter data (sample for performance)
    const scatterData = employees
      .filter(e => e.Conflict_Resolution_Cases != null && e.Teamwork_Skills_Rating != null)
      .slice(0, 500)
      .map(e => ({
        x: +e.Conflict_Resolution_Cases,
        y: +e.Teamwork_Skills_Rating,
        highlighted:
          +e.Conflict_Resolution_Cases > conflictP50 &&
          +e.Teamwork_Skills_Rating < teamworkP50,
      }));

    res.json({ chartData, scatterData, insight, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q13 — Engagement → Satisfaction & Retention (pure stats)
router.get('/q13', async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      Employee_Engagement_Score: 1, Employee_Job_Satisfaction_Score: 1,
      Employee_Resignation_Status: 1,
    }).lean();

    const corrEngSat = pearson(employees, 'Employee_Engagement_Score', 'Employee_Job_Satisfaction_Score');

    // Engagement buckets
    const buckets = [
      { label: 'Low (65-74)', min: 65, max: 74 },
      { label: 'Mid (75-84)', min: 75, max: 84 },
      { label: 'High (85-98)', min: 85, max: 99 },
    ];
    const chartData = buckets.map(b => {
      const group = employees.filter(e => +e.Employee_Engagement_Score >= b.min && +e.Employee_Engagement_Score <= b.max);
      const resigned = group.filter(e => e.Employee_Resignation_Status === 'Yes').length;
      const satVals = safeNums(group, 'Employee_Job_Satisfaction_Score');
      return {
        bucket: b.label,
        count: group.length,
        resignationRate: group.length ? +((resigned / group.length) * 100).toFixed(1) : 0,
        avgSatisfaction: satVals.length ? +ss.mean(satVals).toFixed(2) : 0,
      };
    });

    // Scatter sample
    const scatterData = employees
      .filter(e => e.Employee_Engagement_Score != null && e.Employee_Job_Satisfaction_Score != null)
      .slice(0, 600)
      .map(e => ({
        x: +e.Employee_Engagement_Score,
        y: +e.Employee_Job_Satisfaction_Score,
        resigned: e.Employee_Resignation_Status === 'Yes',
      }));

    res.json({ chartData, scatterData, correlation: corrEngSat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Q14 — High Initiative, Low Innovation → Gemini explains blockers
router.get('/q14', async (req, res) => {
  try {
    const employees = await Employee.find({}, {
      Initiative_Rating: 1, Innovation_Projects_Involvement: 1,
      Department: 1, Job_Title: 1, Overtime_Hours_Per_Week: 1,
      Career_Goals_Achievement_Status: 1,
    }).lean();

    const initiativeP75 = percentileValue(employees, 'Initiative_Rating', 75);
    const blockers = employees.filter(e =>
      +e.Initiative_Rating >= initiativeP75 &&
      e.Innovation_Projects_Involvement === 'No'
    );

    const byDept = {};
    let highOvertime = 0;
    const goalStatus = {};
    for (const e of blockers) {
      byDept[e.Department] = (byDept[e.Department] || 0) + 1;
      if (+e.Overtime_Hours_Per_Week > 10) highOvertime++;
      const gs = e.Career_Goals_Achievement_Status || 'Unknown';
      goalStatus[gs] = (goalStatus[gs] || 0) + 1;
    }

    const juniorRoles = blockers.filter(e =>
      /analyst|junior|associate|intern/i.test(e.Job_Title || '')
    ).length;

    const summary = {
      count: blockers.length,
      pctOfAll: employees.length ? Math.round((blockers.length / employees.length) * 100) : 0,
      initiativeThreshold: initiativeP75,
      pctHighOvertime: blockers.length ? Math.round((highOvertime / blockers.length) * 100) : 0,
      pctJuniorRoles: blockers.length ? Math.round((juniorRoles / blockers.length) * 100) : 0,
      goalAchievementStatus: goalStatus,
      topDepartments: Object.entries(byDept).sort((a, b) => b[1] - a[1]).slice(0, 5),
    };

    const insight = await askGemini(
      'What organizational or structural blockers prevent high-initiative employees from contributing to innovation? Explain 3-4 key reasons.',
      summary,
      'behavioral_q14'
    );

    const chartData = Object.entries(byDept)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({ chartData, insight, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
