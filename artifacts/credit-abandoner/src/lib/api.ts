const API_BASE = '/api';

export interface School { id: number; name: string; }
export interface ScoreRow {
  id: number;
  nickname: string;
  school_name: string;
  score: number;
  played_at: string;
  rank: number;
}
export interface OverallRow {
  nickname: string;
  school_name: string;
  total_score: number;
  rank: number;
}

const NO_CACHE: RequestInit = { cache: 'no-store' };

export async function fetchSchools(): Promise<School[]> {
  const r = await fetch(`${API_BASE}/schools`, NO_CACHE);
  if (!r.ok) throw new Error('Failed to fetch schools');
  return r.json();
}

export async function submitScore(payload: {
  nickname: string;
  schoolId: number;
  gameId: number;
  score: number;
}): Promise<void> {
  await fetch(`${API_BASE}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
}

export async function fetchLeaderboard(gameId: number, schoolId?: number, limit = 20): Promise<ScoreRow[]> {
  const params = new URLSearchParams({ gameId: String(gameId), limit: String(limit) });
  if (schoolId) params.set('schoolId', String(schoolId));
  const r = await fetch(`${API_BASE}/leaderboard?${params}`, NO_CACHE);
  if (!r.ok) throw new Error('Failed to fetch leaderboard');
  return r.json();
}

export async function fetchOverall(schoolId?: number, limit = 20): Promise<OverallRow[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (schoolId) params.set('schoolId', String(schoolId));
  const r = await fetch(`${API_BASE}/leaderboard/overall?${params}`, NO_CACHE);
  if (!r.ok) throw new Error('Failed to fetch overall');
  return r.json();
}
