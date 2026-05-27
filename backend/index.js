require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({ origin: ['http://localhost:3000', 'https://hranalytics.synthomind.cloud'] }));

app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/data', require('./routes/data'));
app.use('/api/analysis/performance', require('./routes/analysis/performance'));
app.use('/api/analysis/training', require('./routes/analysis/training'));
app.use('/api/analysis/behavioral', require('./routes/analysis/behavioral'));
app.use('/api/analysis/projects', require('./routes/analysis/projects'));
app.use('/api/analysis/attrition', require('./routes/analysis/attrition'));
app.use('/api/analysis/compensation', require('./routes/analysis/compensation'));
app.use('/api/analysis/recruitment', require('./routes/analysis/recruitment'));
app.use('/api/rag', require('./routes/rag'));

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message || 'Internal server error' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const Employee = require('./models/Employee');
    await Employee.updateMany(
      { embedding: { $exists: true } },
      { $unset: { embedding: '' } }
    );
    const PORT = process.env.PORT || 5000;
    app.listen(PORT);
  })
  .catch(() => {
    process.exit(1);
  });
