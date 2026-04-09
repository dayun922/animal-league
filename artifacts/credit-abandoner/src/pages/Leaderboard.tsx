import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, RefreshCw, Trophy } from 'lucide-react';
import { fetchLeaderboard, fetchOverall, fetchSchools, type School, type ScoreRow, type OverallRow } from '../lib/api';
import { usePlayer } from '../contexts/PlayerContext';

const GAME_LABELS: Record<number, string> = {
  0: '종합',
  1: '교수 눈피하기',
  2: 'A+ 받기 특훈',
  3: '커피 수혈 릴레이',
  4: '열공 모드',
};

const RANK_COLORS = ['#d97706', '#64748b', '#c2410c'];
const RANK_EMOJIS = ['🥇', '🥈', '🥉'];

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return <span style={{ fontSize: 20 }}>{RANK_EMOJIS[rank - 1]}</span>;
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 28, height: 28, borderRadius: '50%',
      background: '#f1f5f9', color: '#64748b',
      fontSize: 12, fontWeight: 700,
    }}>
      {rank}
    </span>
  );
}

export default function Leaderboard() {
  const { player } = usePlayer();
  const [selectedGame, setSelectedGame] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState(0);
  const [schools, setSchools] = useState<School[]>([]);
  const [rows, setRows] = useState<(ScoreRow | OverallRow)[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchSchools().then(setSchools).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedGame === 0) {
        const data = await fetchOverall(selectedSchool || undefined, 50);
        setRows(data);
      } else {
        const data = await fetchLeaderboard(selectedGame, selectedSchool || undefined, 50);
        setRows(data);
      }
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [selectedGame, selectedSchool]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 15s
  useEffect(() => {
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const myNickname = player?.nickname;
  const scoreKey = selectedGame === 0 ? 'total_score' : 'score';

  return (
    <div style={{
      minHeight: '100dvh', background: 'linear-gradient(180deg, #0f172a, #1e293b)',
      color: 'white', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 16px 0',
      }}>
        <Link href="/">
          <button style={{
            padding: 8, background: 'rgba(255,255,255,0.1)', borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex',
          }}>
            <ChevronLeft style={{ width: 22, height: 22, color: 'white' }} />
          </button>
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy style={{ width: 20, height: 20, color: '#fbbf24' }} />
            <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#fbbf24' }}>실시간 순위</h1>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
            {new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric' })} 오늘의 순위 · 자정 초기화
          </div>
          <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>
            {lastRefresh.toLocaleTimeString('ko-KR')} 갱신 · 15초 자동새로고침
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            padding: '6px 12px', background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20,
            color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <RefreshCw style={{ width: 14, height: 14, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          새로고침
        </button>
      </div>

      {/* Filters */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Game selector */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {Object.entries(GAME_LABELS).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setSelectedGame(Number(id))}
              style={{
                padding: '6px 14px', borderRadius: 20, whiteSpace: 'nowrap',
                background: selectedGame === Number(id) ? '#ea580c' : 'rgba(255,255,255,0.1)',
                border: selectedGame === Number(id) ? '2px solid #ea580c' : '2px solid transparent',
                color: 'white', fontSize: 13, fontWeight: selectedGame === Number(id) ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* School filter */}
        <select
          value={selectedSchool}
          onChange={e => setSelectedSchool(Number(e.target.value))}
          style={{
            padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 13,
          }}
        >
          <option value={0} style={{ background: '#1e293b' }}>🏫 전체 학교</option>
          {schools.map(s => (
            <option key={s.id} value={s.id} style={{ background: '#1e293b' }}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ flex: 1, padding: '0 16px 24px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>불러오는 중...</div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div>아직 기록이 없어요. 첫 번째 도전자가 되세요!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rows.map((row, i) => {
              const rank = (row as ScoreRow).rank ?? i + 1;
              const nick = row.nickname;
              const school = row.school_name;
              const score = (row as ScoreRow).score ?? (row as OverallRow).total_score;
              const isMe = nick === myNickname;

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 12,
                    background: isMe
                      ? 'linear-gradient(90deg, rgba(234,88,12,0.3), rgba(234,88,12,0.1))'
                      : 'rgba(255,255,255,0.05)',
                    border: isMe ? '1.5px solid rgba(234,88,12,0.5)' : '1.5px solid transparent',
                  }}
                >
                  <div style={{ width: 32, textAlign: 'center' }}>
                    <RankBadge rank={rank} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700, fontSize: 15, color: isMe ? '#fb923c' : 'white',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {nick}
                      {isMe && <span style={{ fontSize: 11, background: '#ea580c', padding: '2px 6px', borderRadius: 10 }}>나</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{school}</div>
                  </div>
                  <div style={{
                    fontFamily: 'monospace', fontWeight: 900, fontSize: 18,
                    color: rank === 1 ? '#fbbf24' : rank === 2 ? '#cbd5e1' : rank === 3 ? '#fb923c' : 'white',
                  }}>
                    {score.toLocaleString()}
                    <span style={{ fontSize: 11, fontWeight: 400, color: '#64748b', marginLeft: 2 }}>점</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: #1e293b; }
      `}</style>
    </div>
  );
}
