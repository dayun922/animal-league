import { Router } from 'express';
import pool from '../lib/db';

const router = Router();

router.get('/schools', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM schools ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

export default router;
