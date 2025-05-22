const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// In-memory student attendance data (for demo purposes)
let students = [
  { id: 1, name: 'Ahmad bin Abdullah', attendanceStatus: 'Absent', remarks: '' },
  { id: 2, name: 'Siti Aminah', attendanceStatus: 'Absent', remarks: '' },
  { id: 3, name: 'Raj Kumar', attendanceStatus: 'Absent', remarks: '' },
  { id: 4, name: 'Maria Lopez', attendanceStatus: 'Absent', remarks: '' },
  { id: 5, name: 'John Smith', attendanceStatus: 'Absent', remarks: '' }
];

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(req.method + ' ' + req.url);
  next();
});

// Endpoint to get all students (for frontend sync)
app.get('/students', (req, res) => {
  res.json(students);
});

// Endpoint to add a new student
app.post('/students', (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Student name is required' });
  }
  const duplicate = students.find(s => s.name.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    return res.status(409).json({ error: 'Student with this name already exists' });
  }
  const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
  const newStudent = { id: newId, name: name.trim(), attendanceStatus: 'Absent', remarks: '' };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

// Endpoint to update student details
app.put('/students/:id', (req, res) => {
  const studentId = parseInt(req.params.id);
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Student name is required' });
  }
  const student = students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  const duplicate = students.find(s => s.name.toLowerCase() === name.toLowerCase() && s.id !== studentId);
  if (duplicate) {
    return res.status(409).json({ error: 'Student with this name already exists' });
  }
  student.name = name.trim();
  res.json(student);
});

// Endpoint to delete a student
app.delete('/students/:id', (req, res) => {
  const studentId = parseInt(req.params.id);
  const index = students.findIndex(s => s.id === studentId);
  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }
  const deletedStudent = students.splice(index, 1)[0];
  res.json(deletedStudent);
});

// Endpoint to update attendance by student ID
app.post('/attendance', (req, res) => {
  const { studentId, attendanceStatus, remarks } = req.body;
  if (!studentId || !attendanceStatus) {
    return res.status(400).json({ error: 'studentId and attendanceStatus are required' });
  }

  const student = students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  student.attendanceStatus = attendanceStatus;
  student.remarks = remarks || student.remarks;

  res.json({ message: 'Attendance updated', student });
});

// Start server
app.listen(port, () => {
  console.log('SDCKL Attendance backend API listening at http://localhost:' + port);
});
