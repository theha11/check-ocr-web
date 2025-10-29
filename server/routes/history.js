const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all histories for authenticated user
router.get('/', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const rows = db.getHistoriesByUser(req.user.id);
  res.json(rows);
});

// Add a new history record
router.post('/', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const { content, meta } = req.body;
  if (!content) return res.status(400).json({ error: 'content required' });
  try {
    const row = db.addHistory(req.user.id, content, meta);
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// Delete a history record
router.delete('/:id', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  try {
    const history = db.getHistoryById(id);
    if (!history) {
      return res.status(404).json({ error: 'History not found' });
    }
    // Check if the history belongs to the authenticated user
    if (history.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    db.deleteHistory(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// Update a history record
router.put('/:id', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const { content, meta } = req.body;
  try {
    const history = db.getHistoryById(id);
    if (!history) {
      return res.status(404).json({ error: 'History not found' });
    }
    // Check if the history belongs to the authenticated user
    if (history.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const updated = db.updateHistory(id, content, meta);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
