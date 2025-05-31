const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeRoles } = require('../auth');

// Get all classes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description FROM classes ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching classes:', err);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Add a new class
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { name, description } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Class name is required' });
  }
  try {
    const [existing] = await pool.query('SELECT id FROM classes WHERE name = ?', [name.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Class with this name already exists' });
    }
    const [result] = await pool.query('INSERT INTO classes (name, description) VALUES (?, ?)', [name.trim(), description || null]);
    const newClass = { id: result.insertId, name: name.trim(), description: description || null };
    res.status(201).json(newClass);
  } catch (err) {
    console.error('Error adding class:', err);
    res.status(500).json({ error: 'Failed to add class' });
  }
});

// Update class details
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const classId = parseInt(req.params.id);
  const { name, description } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Class name is required' });
  }
  try {
    const [existing] = await pool.query('SELECT id FROM classes WHERE name = ? AND id != ?', [name.trim(), classId]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Class with this name already exists' });
    }
    const [result] = await pool.query('UPDATE classes SET name = ?, description = ? WHERE id = ?', [name.trim(), description || null, classId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json({ id: classId, name: name.trim(), description: description || null });
  } catch (err) {
    console.error('Error updating class:', err);
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// Delete a class
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const classId = parseInt(req.params.id);
  try {
    const [result] = await pool.query('DELETE FROM classes WHERE id = ?', [classId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json({ message: 'Class deleted' });
  } catch (err) {
    console.error('Error deleting class:', err);
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

module.exports = router;
