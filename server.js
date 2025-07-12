import express from 'express';
import { searchCards } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// serve static frontend
app.use(express.static('.'));

// Fake auth middleware (sets req.user)
app.use((req, res, next) => {
  // In prod, verify JWT; here just stub a user id
  req.user = { user_id: 'demo-user' };
  next();
});

app.get('/api/search', (req, res) => {
  const term = (req.query.term || '').trim();
  const rows = searchCards(term);
  res.json(rows);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
