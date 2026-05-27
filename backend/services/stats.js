const ss = require('simple-statistics');

function safeNums(docs, field) {
  return docs.map(d => +d[field]).filter(v => !isNaN(v) && isFinite(v));
}

function safeMean(docs, field) {
  const vals = safeNums(docs, field);
  return vals.length ? +ss.mean(vals).toFixed(3) : null;
}

function pearson(docs, fieldA, fieldB) {
  const pairs = docs.filter(d => d[fieldA] != null && d[fieldB] != null && !isNaN(+d[fieldA]) && !isNaN(+d[fieldB]));
  if (pairs.length < 3) return 0;
  try {
    return +ss.sampleCorrelation(pairs.map(d => +d[fieldA]), pairs.map(d => +d[fieldB])).toFixed(4);
  } catch {
    return 0;
  }
}

function groupMeans(docs, groupField, valueFields) {
  const groups = {};
  for (const doc of docs) {
    const key = String(doc[groupField] || 'Unknown');
    if (!groups[key]) groups[key] = { count: 0, sums: {} };
    groups[key].count++;
    for (const f of valueFields) {
      const v = +doc[f];
      if (!isNaN(v) && isFinite(v)) {
        groups[key].sums[f] = (groups[key].sums[f] || 0) + v;
      }
    }
  }
  return Object.entries(groups).map(([group, g]) => ({
    group,
    count: g.count,
    ...Object.fromEntries(valueFields.map(f => [f, g.sums[f] ? +(g.sums[f] / g.count).toFixed(3) : 0]))
  }));
}

function topPercentile(docs, field, pct) {
  const vals = safeNums(docs, field).sort((a, b) => a - b);
  if (!vals.length) return [];
  const threshold = ss.quantile(vals, (100 - pct) / 100);
  return docs.filter(d => +d[field] >= threshold);
}

function percentileValue(docs, field, p) {
  const vals = safeNums(docs, field).sort((a, b) => a - b);
  return vals.length ? ss.quantile(vals, p / 100) : 0;
}

function zScoreFilter(docs, field, minZ) {
  const vals = safeNums(docs, field);
  if (vals.length < 2) return [];
  const mean = ss.mean(vals);
  const std = ss.standardDeviation(vals);
  return docs.filter(d => ((+d[field] - mean) / std) >= minZ);
}

function twoGroupDiff(groupA, groupB, fields) {
  return fields
    .map(f => {
      const aVals = safeNums(groupA, f);
      const bVals = safeNums(groupB, f);
      const aMean = aVals.length ? ss.mean(aVals) : 0;
      const bMean = bVals.length ? ss.mean(bVals) : 0;
      return {
        field: f.replace(/_/g, ' '),
        rawField: f,
        groupA: +aMean.toFixed(3),
        groupB: +bMean.toFixed(3),
        diff: +(aMean - bMean).toFixed(3),
        absDiff: +Math.abs(aMean - bMean).toFixed(3),
      };
    })
    .sort((a, b) => b.absDiff - a.absDiff);
}

function euclidDist(a, b) {
  return Math.sqrt(a.reduce((s, v, i) => s + Math.pow(v - b[i], 2), 0));
}

function kmeans(points, k, maxIter = 100) {
  if (points.length < k) {
    return { assignments: points.map((_, i) => i % k), centroids: points.slice(0, k) };
  }
  const dims = points[0].length;

  // Normalize
  const mins = Array(dims).fill(Infinity);
  const maxs = Array(dims).fill(-Infinity);
  for (const p of points) {
    for (let d = 0; d < dims; d++) {
      mins[d] = Math.min(mins[d], p[d]);
      maxs[d] = Math.max(maxs[d], p[d]);
    }
  }
  const norm = points.map(p =>
    p.map((v, d) => (maxs[d] === mins[d] ? 0 : (v - mins[d]) / (maxs[d] - mins[d])))
  );

  // K-means++ initialization (seeded for reproducibility)
  let seed = 42;
  function rand() {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    return seed / 0x7fffffff;
  }
  const cidxs = [Math.floor(rand() * norm.length)];
  while (cidxs.length < k) {
    const dists = norm.map(p => Math.min(...cidxs.map(ci => euclidDist(p, norm[ci]))));
    const total = dists.reduce((s, d) => s + d * d, 0);
    let r = rand() * total;
    let chosen = norm.length - 1;
    for (let i = 0; i < dists.length; i++) {
      r -= dists[i] * dists[i];
      if (r <= 0) { chosen = i; break; }
    }
    cidxs.push(chosen);
  }
  let centroids = cidxs.map(i => [...norm[i]]);
  let assignments = new Array(norm.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    for (let i = 0; i < norm.length; i++) {
      let minD = Infinity, minJ = 0;
      for (let j = 0; j < k; j++) {
        const d = euclidDist(norm[i], centroids[j]);
        if (d < minD) { minD = d; minJ = j; }
      }
      if (assignments[i] !== minJ) { assignments[i] = minJ; changed = true; }
    }
    if (!changed) break;
    for (let j = 0; j < k; j++) {
      const pts = norm.filter((_, i) => assignments[i] === j);
      if (pts.length > 0) {
        centroids[j] = Array(dims).fill(0).map((_, d) =>
          pts.reduce((s, p) => s + p[d], 0) / pts.length
        );
      }
    }
  }

  // Denormalize centroids back to original scale
  const origCentroids = centroids.map(c =>
    c.map((v, d) => +(v * (maxs[d] - mins[d]) + mins[d]).toFixed(3))
  );
  return { assignments, centroids: origCentroids };
}

module.exports = { safeNums, safeMean, pearson, groupMeans, topPercentile, percentileValue, zScoreFilter, twoGroupDiff, kmeans };
