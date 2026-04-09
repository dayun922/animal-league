import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { fetchSchools, type School } from '../lib/api';
import { usePlayer } from '../contexts/PlayerContext';

function SchoolCombobox({
  schools,
  value,
  onChange,
}: {
  schools: School[];
  value: number;
  onChange: (id: number, name: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedSchool = schools.find(s => s.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter(s => s.name.toLowerCase().includes(q));
  }, [query, schools]);

  const handleSelect = (school: School) => {
    onChange(school.id, school.name);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    if (e.target.value === '') onChange(0, '');
  };

  const handleInputFocus = () => {
    setOpen(true);
    setQuery('');
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    if (listRef.current?.contains(e.relatedTarget as Node)) return;
    setTimeout(() => setOpen(false), 150);
  };

  const displayValue = open ? query : (selectedSchool?.name ?? '');

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        border: open ? '2px solid #ea580c' : '2px solid #e2e8f0',
        borderRadius: 10, background: 'white',
        transition: 'border-color 0.15s',
      }}>
        <input
          ref={inputRef}
          type="text"
          placeholder={selectedSchool ? selectedSchool.name : "학교명 검색..."}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          autoComplete="off"
          style={{
            flex: 1, padding: '12px 14px', border: 'none', outline: 'none',
            fontSize: 15, background: 'transparent',
            color: !open && selectedSchool ? '#1e293b' : '#374151',
            borderRadius: 10,
          }}
        />
        {selectedSchool && !open && (
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); onChange(0, ''); setQuery(''); }}
            style={{
              padding: '0 12px', background: 'none', border: 'none',
              cursor: 'pointer', color: '#94a3b8', fontSize: 18, lineHeight: 1,
            }}
            aria-label="clear"
          >
            ×
          </button>
        )}
        <div style={{ padding: '0 12px', color: '#94a3b8', pointerEvents: 'none', fontSize: 13 }}>
          {open ? '▲' : '▼'}
        </div>
      </div>

      {open && (
        <div
          ref={listRef}
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: 'white', borderRadius: 12, zIndex: 100,
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            border: '1.5px solid #e2e8f0',
            maxHeight: 260, overflowY: 'auto',
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '14px 16px', color: '#94a3b8', fontSize: 14, textAlign: 'center' }}>
              검색 결과가 없습니다
            </div>
          ) : (
            filtered.map(school => (
              <button
                key={school.id}
                type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(school); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '11px 16px', border: 'none', background: 'none',
                  fontSize: 14, cursor: 'pointer', color: '#1e293b',
                  borderBottom: '1px solid #f1f5f9',
                  fontWeight: school.id === value ? 700 : 400,
                  backgroundColor: school.id === value ? '#fff7ed' : 'transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = school.id === value ? '#fff7ed' : 'transparent')}
              >
                {school.id === value && <span style={{ color: '#ea580c', marginRight: 6 }}>✓</span>}
                {school.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function Entry() {
  const [, navigate] = useLocation();
  const { setPlayer } = usePlayer();

  const [schools, setSchools]     = useState<School[]>([]);
  const [schoolId, setSchoolId]   = useState<number>(0);
  const [schoolName, setSchoolName] = useState('');
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
    setPlayer({ nickname: nickname.trim(), schoolId, schoolName });
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
        maxWidth: 400, width: '100%',
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
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: 14, color: '#334155', marginBottom: 6 }}>
              🏫 학교 선택
            </label>
            {loading ? (
              <div style={{ padding: '12px 16px', background: '#f1f5f9', borderRadius: 10, color: '#94a3b8', fontSize: 14 }}>
                불러오는 중...
              </div>
            ) : (
              <SchoolCombobox
                schools={schools}
                value={schoolId}
                onChange={(id, name) => { setSchoolId(id); setSchoolName(name); setError(''); }}
              />
            )}
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              {schools.length > 0 ? `총 ${schools.length}개 대학교` : ''} · 이름으로 검색하세요
            </div>
          </div>

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
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#ea580c')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
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
            disabled={submitting || !schoolId || !nickname.trim()}
            style={{
              width: '100%', padding: '15px 0', borderRadius: 14,
              background: (submitting || !schoolId || !nickname.trim()) ? '#e2e8f0' : '#ea580c',
              color: (submitting || !schoolId || !nickname.trim()) ? '#94a3b8' : 'white',
              fontSize: 17, fontWeight: 900,
              border: 'none', cursor: (submitting || !schoolId || !nickname.trim()) ? 'not-allowed' : 'pointer',
              boxShadow: (submitting || !schoolId || !nickname.trim()) ? 'none' : '0 4px 0 #9a3412',
              transition: 'all 0.15s',
            }}
          >
            {submitting ? '입장 중...' : '게임 시작 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}
