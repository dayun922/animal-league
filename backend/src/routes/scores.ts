import { Router } from 'express';
import pool from '../lib/db';

const router = Router();

/* POST /api/scores — submit a score */
router.post('/scores', async (req, res) => {
  const { nickname, schoolId, gameId, score } = req.body as {
    nickname: string;
    schoolId: number;
    gameId: number;
    score: number;
  };

  if (!nickname || !schoolId || !gameId || score == null) {
    return res.status(400).json({ error: 'nickname, schoolId, gameId, score required' });
  }
  if (gameId < 1 || gameId > 4) {
    return res.status(400).json({ error: 'gameId must be 1-4' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO scores (nickname, school_id, game_id, score)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [nickname.trim().slice(0, 50), schoolId, gameId, score]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

/* GET /api/leaderboard?gameId=1&schoolId=2&limit=20
   오늘(KST 기준) 점수만 표시 */
router.get('/leaderboard', async (req, res) => {
  const gameId   = parseInt(req.query['gameId']   as string) || 0;
  const schoolId = parseInt(req.query['schoolId'] as string) || 0;
  const limit    = Math.min(parseInt(req.query['limit'] as string) || 20, 100);

  if (gameId < 1 || gameId > 4) {
    return res.status(400).json({ error: 'gameId 1-4 required' });
  }

  try {
    const params: (number | string)[] = [gameId, limit];
    let schoolClause = '';
    if (schoolId) {
      schoolClause = 'AND s.school_id = $3';
      params.push(schoolId);
    }

    const result = await pool.query(
      `SELECT
         s.id,
         s.nickname,
         sc.name  AS school_name,
         s.score,
         s.played_at,
         RANK() OVER (ORDER BY s.score DESC) AS rank
       FROM scores s
       LEFT JOIN schools sc ON sc.id = s.school_id
       WHERE s.game_id = $1
         AND DATE(s.played_at AT TIME ZONE 'Asia/Seoul') = (NOW() AT TIME ZONE 'Asia/Seoul')::date
         ${schoolClause}
       ORDER BY s.score DESC
       LIMIT $2`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/* GET /api/leaderboard/overall?schoolId=2
   오늘(KST 기준) 기준 종합 순위 */
router.get('/leaderboard/overall', async (req, res) => {
  const schoolId = parseInt(req.query['schoolId'] as string) || 0;
  const limit    = Math.min(parseInt(req.query['limit']    as string) || 20, 100);

  try {
    const params: (number | string)[] = [limit];
    let schoolClause = '';
    if (schoolId) {
      schoolClause = 'AND best.school_id = $2';
      params.push(schoolId);
    }

    const result = await pool.query(
      `SELECT
         best.nickname,
         sc.name AS school_name,
         SUM(best.best_score) AS total_score,
         RANK() OVER (ORDER BY SUM(best.best_score) DESC) AS rank
       FROM (
         SELECT nickname, school_id, game_id, MAX(score) AS best_score
         FROM scores
         WHERE DATE(played_at AT TIME ZONE 'Asia/Seoul') = (NOW() AT TIME ZONE 'Asia/Seoul')::date
         GROUP BY nickname, school_id, game_id
       ) best
       LEFT JOIN schools sc ON sc.id = best.school_id
       WHERE 1=1
       ${schoolClause}
       GROUP BY best.nickname, best.school_id, sc.name
       ORDER BY total_score DESC
       LIMIT $1`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch overall leaderboard' });
  }
});

export default router;
