const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeRoles } = require('../auth');

// Mark or update attendance for a student on a specific date
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  const { studentId, attendanceDate, attendanceStatus, remarks } = req.body;
  if (!studentId || !attendanceDate || !attendanceStatus) {
    return res.status(400).json({ error: 'studentId, attendanceDate, and attendanceStatus are required' });
  }
  try {
    // Check if attendance record exists
    const [existing] = await pool.query(
      'SELECT id FROM attendance WHERE student_id = ? AND attendance_date = ?',
      [studentId, attendanceDate]
    );
    if (existing.length > 0) {
      // Update existing record
      await pool.query(
        'UPDATE attendance SET attendance_status = ?, remarks = ?, updated_at = NOW() WHERE id = ?',
        [attendanceStatus, remarks || null, existing[0].id]
      );
      res.json({ message: 'Attendance updated' });
    } else {
      // Insert new record
      await pool.query(
        'INSERT INTO attendance (student_id, attendance_date, attendance_status, remarks) VALUES (?, ?, ?, ?)',
        [studentId, attendanceDate, attendanceStatus, remarks || null]
      );
      res.status(201).json({ message: 'Attendance recorded' });
    }
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Get attendance records with optional filters
router.get('/', authenticateToken, async (req, res) => {
  const { studentId, classId, dateFrom, dateTo } = req.query;
  try {
    let query = `
      SELECT a.id, a.student_id, s.name AS student_name, a.attendance_date, a.attendance_status, a.remarks
      FROM attendance a
      JOIN students s ON a.student_id = s.id
    `;
    const conditions = [];
    const params = [];

    if (classId) {
      query += ' JOIN student_classes sc ON s.id = sc.student_id ';
      conditions.push('sc.class_id = ?');
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
    res.json(rows);
  } catch (err) {
    console.error('Error fetching attendance records:', err);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

module.exports = router;
