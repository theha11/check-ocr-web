const express = require('express');
const cors = require('cors');
const { openDatabase } = require('./lib/db');
const authRoutes = require('./routes/auth');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const db = openDatabase();
app.locals.db = db;

app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

app.get('/', (req, res) => res.json({ ok: true, message: 'API running' }));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
