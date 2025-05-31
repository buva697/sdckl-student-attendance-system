const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeRoles } = require('../auth');
const { Parser } = require('json2csv');

// Generate attendance report with filters
router.get('/attendance', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  const { studentId, classId, dateFrom, dateTo, exportCsv } = req.query;
  try {
    let query = `
      SELECT a.attendance_date, s.name AS student_name, c.name AS class_name, a.attendance_status, a.remarks
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN student_classes sc ON s.id = sc.student_id
      LEFT JOIN classes c ON sc.class_id = c.id
    `;
    const conditions = [];
    const params = [];

    if (classId) {
      conditions.push('c.id = ?');
      params.push(classId);
    }
    if (studentId) {
      conditions.push('a.student_id = ?');
      params.push(studentId);
    }
    if (dateFrom) {
      conditions.push('a.attendance_date >= ?');
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push('a.attendance_date <= ?');
      params.push(dateTo);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY a.attendance_date DESC, s.name';

    const [rows] = await pool.query(query, params);

    if (exportCsv === 'true') {
      const fields = ['attendance_date', 'student_name', 'class_name', 'attendance_status', 'remarks'];
      const parser = new Parser({ fields });
      const csv = parser.parse(rows);
      res.header('Content-Type', 'text/csv');
      res.attachment('attendance_report.csv');
      return res.send(csv);
    }

    res.json(rows);
  } catch (err) {
    console.error('Error generating attendance report:', err);
    res.status(500).json({ error: 'Failed to generate attendance report' });
  }
});

module.exports = router;
