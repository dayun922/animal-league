import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { fetchSchools, type School } from '../lib/api';
import { usePlayer } from '../contexts/PlayerContext';

export default function Entry() {
  const [, navigate] = useLocation();
  const { setPlayer } = usePlayer();

  const [schools, setSchools]     = useState<School[]>([]);
  const [schoolId, setSchoolId]   = useState<number>(0);
  const [nickname, setNickname]   = useState('');
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    fetchSchools()
      .then(data => { setSchools(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) { setError('닉네임을 입력해주세요.'); return; }
    if (!schoolId)         { setError('학교를 선택해주세요.'); return; }

    setSubmitting(true);
    const school = schools.find(s => s.id === schoolId);
    setPlayer({
      nickname: nickname.trim(),
      schoolId,
      schoolName: school?.name || '',
    });
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: 24,
    }}>
      <div style={{
        background: 'white', borderRadius: 28, padding: '36px 32px',
        maxWidth: 380, width: '100%',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🎓</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1e293b', margin: 0 }}>
            학점 포기자
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>
            공부 빼고 다 재밌는 사람들의 대결
          </p>
        </div>

        <form onSubmit={handleStart}>
          {/* School select */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: 14, color: '#334155', marginBottom: 6 }}>
              🏫 학교 선택
            </label>
            {loading ? (
              <div style={{ padding: '12px 16px', background: '#f1f5f9', borderRadius: 10, color: '#94a3b8', fontSize: 14 }}>
                불러오는 중...
              </div>
            ) : (
              <select
                value={schoolId}
                onChange={e => setSchoolId(Number(e.target.value))}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  border: '2px solid #e2e8f0', fontSize: 15, background: 'white',
                  color: schoolId ? '#1e293b' : '#94a3b8',
                  outline: 'none', appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value={0}>-- 학교를 선택하세요 --</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Nickname */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: 14, color: '#334155', marginBottom: 6 }}>
              ✏️ 닉네임
            </label>
            <input
              type="text"
              maxLength={20}
              placeholder="ex) 공대생A"
              value={nickname}
              onChange={e => { setNickname(e.target.value); setError(''); }}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '2px solid #e2e8f0', fontSize: 15,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              최대 20자 · 중복 허용
            </div>
          </div>

          {error && (
            <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '15px 0', borderRadius: 14,
              background: '#ea580c', color: 'white', fontSize: 17, fontWeight: 900,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 0 #9a3412',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            게임 시작 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
