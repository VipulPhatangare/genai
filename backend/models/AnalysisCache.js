const mongoose = require('mongoose');

const analysisCacheSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  result: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 }, // TTL: 24 hours
});

module.exports = mongoose.model('AnalysisCache', analysisCacheSchema);
