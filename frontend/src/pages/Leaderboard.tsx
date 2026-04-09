import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, RefreshCw, Trophy, Search, X } from 'lucide-react';
import { fetchLeaderboard, fetchOverall, fetchSchools, type School, type ScoreRow, type OverallRow } from '../lib/api';
import { usePlayer } from '../contexts/PlayerContext';

const GAME_LABELS: Record<number, string> = {
  0: '종합',
  1: '교수 눈피하기',
  2: 'A+ 받기 특훈',
  3: '커피 수혈 릴레이',
  4: '열공 모드',
};

const RANK_EMOJIS = ['🥇', '🥈', '🥉'];

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) return <span style={{ fontSize: 20 }}>{RANK_EMOJIS[rank - 1]}</span>;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 28, height: 28, borderRadius: '50%',
      background: '#1e293b', color: '#64748b',
      fontSize: 12, fontWeight: 700, border: '1px solid #334155',
    }}>
      {rank}
    </span>
  );
}

/* ── 학교 검색 컴포넌트 ──────────────────────────────────── */
function SchoolSearch({
  schools,
  value,
  onChange,
}: {
  schools: School[];
  value: number;
  onChange: (id: number) => void;
}) {
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);
  const inputRef            = useRef<HTMLInputElement>(null);
  const listRef             = useRef<HTMLDivElement>(null);
  const selected            = schools.find(s => s.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? schools.filter(s => s.name.toLowerCase().includes(q)) : schools;
  }, [query, schools]);

  const handleSelect = (school: School | null) => {
    onChange(school ? school.id : 0);
    setQuery('');
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(255,255,255,0.08)',
        border: open ? '1.5px solid #ea580c' : '1.5px solid rgba(255,255,255,0.15)',
        borderRadius: 12, padding: '8px 12px',
        transition: 'border-color 0.15s',
      }}>
        <Search style={{ width: 15, height: 15, color: '#64748b', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          placeholder={selected ? selected.name : '🏫 학교 검색...'}
          value={open ? query : ''}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={e => { if (!listRef.current?.contains(e.relatedTarget as Node)) setTimeout(() => setOpen(false), 150); }}
          autoComplete="off"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: !open && selected ? '#fb923c' : 'white', fontSize: 13,
            fontWeight: !open && selected ? 700 : 400,
          }}
        />
        {value !== 0 && (
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); handleSelect(null); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
          >
            <X style={{ width: 14, height: 14, color: '#64748b' }} />
          </button>
        )}
      </div>

      {open && (
        <div
          ref={listRef}
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: '#1e293b', border: '1.5px solid #334155',
            borderRadius: 12, zIndex: 200,
            maxHeight: 240, overflowY: 'auto',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}
        >
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); handleSelect(null); }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '10px 14px', background: value === 0 ? 'rgba(234,88,12,0.15)' : 'none',
              border: 'none', borderBottom: '1px solid #334155',
              color: '#94a3b8', fontSize: 13, cursor: 'pointer', fontWeight: value === 0 ? 700 : 400,
            }}
          >
            {value === 0 && <span style={{ color: '#ea580c', marginRight: 6 }}>✓</span>}
            🏫 전체 학교
          </button>
          {filtered.length === 0 ? (
            <div style={{ padding: '12px 14px', color: '#64748b', fontSize: 13, textAlign: 'center' }}>
              검색 결과 없음
            </div>
          ) : filtered.map(school => (
            <button
              key={school.id}
              type="button"
              onMouseDown={e => { e.preventDefault(); handleSelect(school); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 14px', background: school.id === value ? 'rgba(234,88,12,0.15)' : 'none',
                border: 'none', borderBottom: '1px solid #1e293b',
                color: school.id === value ? '#fb923c' : 'white',
                fontSize: 13, cursor: 'pointer', fontWeight: school.id === value ? 700 : 400,
              }}
              onMouseEnter={e => { if (school.id !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = school.id === value ? 'rgba(234,88,12,0.15)' : 'none'; }}
            >
              {school.id === value && <span style={{ marginRight: 6 }}>✓</span>}
              {school.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 메인 컴포넌트 ────────────────────────────────────────── */
export default function Leaderboard() {
  const { player } = usePlayer();
  const [selectedGame,   setSelectedGame]   = useState(0);
  const [selectedSchool, setSelectedSchool] = useState(0);
  const [schools,  setSchools]  = useState<School[]>([]);
  const [rows,     setRows]     = useState<(ScoreRow | OverallRow)[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => { fetchSchools().then(setSchools).catch(() => {}); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedGame === 0) {
        setRows(await fetchOverall(selectedSchool || undefined, 50));
      } else {
        setRows(await fetchLeaderboard(selectedGame, selectedSchool || undefined, 50));
      }
    } catch { setRows([]); }
    finally { setLoading(false); setLastRefresh(new Date()); }
  }, [selectedGame, selectedSchool]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const myNickname = player?.nickname;

  return (
    <div style={{
      minHeight: '100dvh', background: 'linear-gradient(180deg, #0f172a, #1e293b)',
      color: 'white', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 16px 0' }}>
        <Link href="/">
          <button style={{
            padding: 8, background: 'rgba(255,255,255,0.1)', borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', marginTop: 2,
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
            color: 'white', fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <RefreshCw style={{ width: 14, height: 14, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          새로고침
        </button>
      </div>

      {/* Filters */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Game tabs */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {Object.entries(GAME_LABELS).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setSelectedGame(Number(id))}
              style={{
                padding: '6px 14px', borderRadius: 20, whiteSpace: 'nowrap',
                background: selectedGame === Number(id) ? '#ea580c' : 'rgba(255,255,255,0.08)',
                border: selectedGame === Number(id) ? '2px solid #ea580c' : '2px solid transparent',
                color: 'white', fontSize: 13,
                fontWeight: selectedGame === Number(id) ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* School search */}
        <SchoolSearch
          schools={schools}
          value={selectedSchool}
          onChange={setSelectedSchool}
        />
      </div>

      {/* Rank list */}
      <div style={{ flex: 1, padding: '0 16px 24px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>불러오는 중...</div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div>아직 오늘의 기록이 없어요.</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>첫 번째 도전자가 되세요!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rows.map((row, i) => {
              const rank   = Number((row as ScoreRow).rank ?? i + 1);
              const nick   = row.nickname;
              const school = row.school_name;
              const score  = Number((row as ScoreRow).score ?? (row as OverallRow).total_score);
              const isMe   = nick === myNickname && row.school_name === player?.schoolName;

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
                  <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
                    <RankBadge rank={rank} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700, fontSize: 15,
                      color: isMe ? '#fb923c' : 'white',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {nick}
                      </span>
                      {isMe && (
                        <span style={{
                          fontSize: 11, background: '#ea580c',
                          padding: '2px 6px', borderRadius: 10, flexShrink: 0,
                        }}>나</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {school}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'monospace', fontWeight: 900, fontSize: 18, flexShrink: 0,
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
      `}</style>
    </div>
  );
}
