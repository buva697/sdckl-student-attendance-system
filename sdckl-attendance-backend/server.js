const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { login } = require('./auth');
const studentsRouter = require('./routes/students');
const classesRouter = require('./routes/classes');
const attendanceRouter = require('./routes/attendance');
const biometricRouter = require('./routes/biometric');
const reportsRouter = require('./routes/reports');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(req.method + ' ' + req.url);
  next();
});

// Auth routes
app.post('/api/login', login);

// API routes
app.use('/api/students', studentsRouter);
app.use('/api/classes', classesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/biometric', biometricRouter);
app.use('/api/reports', reportsRouter);

// Basic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log('SDCKL Attendance backend API listening at http://localhost:' + port);
});
