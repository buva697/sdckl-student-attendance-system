const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeRoles } = require('../auth');

// Get biometric scan logs with pagination and filtering
router.get('/logs', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { page = 1, limit = 10, studentId, status, dateFrom, dateTo } = req.query;
    let query = 'SELECT id, student_id, scan_timestamp, status FROM biometric_logs WHERE 1=1';
    const params = [];

    if (studentId) {
      query += ' AND student_id = ?';
      params.push(studentId);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (dateFrom) {
      query += ' AND scan_timestamp >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND scan_timestamp <= ?';
      params.push(dateTo);
    }

    query += ' ORDER BY scan_timestamp DESC LIMIT ? OFFSET ?';
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;
    params.push(limitNum, offset);

    const [rows] = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM biometric_logs WHERE 1=1';
    const countParams = [];
    if (studentId) countParams.push(studentId);
    if (status) countParams.push(status);
    if (dateFrom) countParams.push(dateFrom);
    if (dateTo) countParams.push(dateTo);
    // Build count query conditions same as above
    let conditions = [];
    if (studentId) conditions.push('student_id = ?');
    if (status) conditions.push('status = ?');
    if (dateFrom) conditions.push('scan_timestamp >= ?');
    if (dateTo) conditions.push('scan_timestamp <= ?');
    if (conditions.length > 0) {
      countQuery += ' AND ' + conditions.join(' AND ');
    }
    const [countRows] = await pool.query(countQuery, countParams);
    const totalLogs = countRows[0].total;

    res.json({
      page: pageNum,
      limit: limitNum,
      totalLogs,
      logs: rows
    });
  } catch (err) {
    console.error('Error fetching biometric logs:', err);
    res.status(500).json({ error: 'Failed to fetch biometric logs' });
  }
});

// Record a biometric scan event
router.post('/scan', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  const { studentId, status } = req.body;
  if (!studentId || !status) {
    return res.status(400).json({ error: 'studentId and status are required' });
  }
  try {
    // Check if student exists
    const [students] = await pool.query('SELECT id FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Insert biometric log
    const [result] = await pool.query(
      'INSERT INTO biometric_logs (student_id, status) VALUES (?, ?)',
      [studentId, status]
    );

    // If status is success, update attendance status to Present for today
    if (status === 'success') {
      const today = new Date().toISOString().slice(0, 10);
      // Check if attendance record exists
      const [existing] = await pool.query(
        'SELECT id FROM attendance WHERE student_id = ? AND attendance_date = ?',
        [studentId, today]
      );
      if (existing.length > 0) {
        await pool.query(
          'UPDATE attendance SET attendance_status = ?, updated_at = NOW() WHERE id = ?',
          ['Present', existing[0].id]
        );
      } else {
        await pool.query(
          'INSERT INTO attendance (student_id, attendance_date, attendance_status) VALUES (?, ?, ?)',
          [studentId, today, 'Present']
        );
      }
    }

    res.status(201).json({ message: 'Biometric scan recorded', logId: result.insertId });
  } catch (err) {
    console.error('Error recording biometric scan:', err);
    res.status(500).json({ error: 'Failed to record biometric scan' });
  }
});

module.exports = router;
