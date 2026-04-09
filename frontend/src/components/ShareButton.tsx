import React, { useState } from 'react';
import { shareToEverytime, type SharePayload } from '../lib/share';

interface Props {
  payload: SharePayload;
  /** 버튼 스타일 변형 */
  variant?: 'light' | 'dark' | 'orange';
  className?: string;
}

const EVERYTIME_ORANGE = '#ff6f00';

export function ShareButton({ payload, variant = 'light', className = '' }: Props) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'shared'>('idle');

  const handleShare = async () => {
    const result = await shareToEverytime(payload);
    if (result === 'copied') {
      setStatus('copied');
      setTimeout(() => setStatus('idle'), 2200);
    } else if (result === 'shared') {
      setStatus('shared');
      setTimeout(() => setStatus('idle'), 2200);
    }
  };

  const label =
    status === 'copied' ? '✅ 복사됨! 에브리타임에 붙여넣기 하세요' :
    status === 'shared' ? '✅ 공유 완료!' :
    '📣 에브리타임에 공유하기';

  const styles: Record<string, React.CSSProperties> = {
    light: {
      background: status !== 'idle' ? '#f0fdf4' : 'white',
      color: status !== 'idle' ? '#16a34a' : EVERYTIME_ORANGE,
      border: `2px solid ${status !== 'idle' ? '#bbf7d0' : EVERYTIME_ORANGE}`,
    },
    dark: {
      background: status !== 'idle' ? 'rgba(22,163,74,0.15)' : 'rgba(255,111,0,0.12)',
      color: status !== 'idle' ? '#4ade80' : '#ffb347',
      border: `2px solid ${status !== 'idle' ? 'rgba(74,222,128,0.3)' : 'rgba(255,111,0,0.3)'}`,
    },
    orange: {
      background: status !== 'idle' ? '#16a34a' : EVERYTIME_ORANGE,
      color: 'white',
      border: 'none',
    },
  };

  return (
    <button
      onClick={handleShare}
      className={className}
      style={{
        width: '100%',
        padding: '13px 16px',
        borderRadius: 14,
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        letterSpacing: '-0.01em',
        ...styles[variant],
      }}
    >
      {status === 'idle' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      )}
      {label}
    </button>
  );
}
