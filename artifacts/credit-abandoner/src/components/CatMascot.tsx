import React from 'react';

export function CatMascot({ className = "", state = "normal" }: { className?: string, state?: "normal" | "happy" | "sad" | "shocked" }) {
  return (
    <div className={`relative inline-block ${className}`} style={{ width: '120px', height: '120px' }}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Ears */}
        <polygon points="15,40 25,10 45,30" fill="#e2e8f0" />
        <polygon points="22,35 27,18 40,30" fill="#fbcfe8" />
        <polygon points="85,40 75,10 55,30" fill="#e2e8f0" />
        <polygon points="78,35 73,18 60,30" fill="#fbcfe8" />
        
        {/* Face */}
        <circle cx="50" cy="55" r="40" fill="#f8fafc" />
        
        {/* Eyes */}
        {state === "happy" ? (
          <>
            <path d="M 30 50 Q 35 45 40 50" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
            <path d="M 60 50 Q 65 45 70 50" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : state === "sad" ? (
          <>
            <path d="M 30 50 Q 35 45 40 50" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
            <circle cx="35" cy="55" r="2" fill="#3b82f6" opacity="0.8" />
            <path d="M 60 50 Q 65 45 70 50" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
            <circle cx="65" cy="55" r="2" fill="#3b82f6" opacity="0.8" />
          </>
        ) : state === "shocked" ? (
          <>
            <circle cx="35" cy="50" r="4" fill="#1e293b" />
            <circle cx="65" cy="50" r="4" fill="#1e293b" />
          </>
        ) : (
          <>
            <circle cx="35" cy="50" r="4" fill="#1e293b" />
            <circle cx="65" cy="50" r="4" fill="#1e293b" />
          </>
        )}
        
        {/* Nose */}
        <polygon points="48,60 52,60 50,63" fill="#f43f5e" />
        
        {/* Mouth */}
        {state === "sad" ? (
          <path d="M 45 70 Q 50 65 55 70" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        ) : state === "shocked" ? (
          <circle cx="50" cy="70" r="5" fill="#1e293b" />
        ) : (
          <path d="M 45 65 Q 50 70 55 65" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        )}
        
        {/* Whiskers */}
        <line x1="10" y1="55" x2="25" y2="58" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="62" x2="23" y2="62" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        
        <line x1="90" y1="55" x2="75" y2="58" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <line x1="92" y1="62" x2="77" y2="62" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        
        {/* Cheeks */}
        {state !== "sad" && (
          <>
            <ellipse cx="28" cy="62" rx="4" ry="2.5" fill="#fecdd3" opacity="0.6" />
            <ellipse cx="72" cy="62" rx="4" ry="2.5" fill="#fecdd3" opacity="0.6" />
          </>
        )}
      </svg>
    </div>
  );
}
