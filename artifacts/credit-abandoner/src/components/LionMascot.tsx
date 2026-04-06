import React from 'react';

export function LionMascot({ className = "", state = "normal" }: { className?: string, state?: "normal" | "happy" | "sad" | "shocked" }) {
  return (
    <div className={`relative inline-block ${className}`} style={{ width: '120px', height: '120px' }}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Mane */}
        <circle cx="50" cy="50" r="45" fill="#f59e0b" />
        <circle cx="20" cy="30" r="15" fill="#d97706" />
        <circle cx="80" cy="30" r="15" fill="#d97706" />
        <circle cx="20" cy="70" r="15" fill="#d97706" />
        <circle cx="80" cy="70" r="15" fill="#d97706" />
        <circle cx="50" cy="15" r="15" fill="#d97706" />
        <circle cx="50" cy="85" r="15" fill="#d97706" />
        <circle cx="85" cy="50" r="15" fill="#d97706" />
        <circle cx="15" cy="50" r="15" fill="#d97706" />
        
        {/* Face */}
        <circle cx="50" cy="50" r="35" fill="#fde68a" />
        
        {/* Ears inside */}
        <circle cx="25" cy="30" r="8" fill="#fde68a" />
        <circle cx="75" cy="30" r="8" fill="#fde68a" />
        
        {/* Eyes */}
        {state === "happy" ? (
          <>
            <path d="M 30 45 Q 35 40 40 45" fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
            <path d="M 60 45 Q 65 40 70 45" fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : state === "sad" ? (
          <>
            <path d="M 30 45 Q 35 40 40 45" fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
            <circle cx="35" cy="50" r="2" fill="#3b82f6" opacity="0.8" />
            <path d="M 60 45 Q 65 40 70 45" fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
            <circle cx="65" cy="50" r="2" fill="#3b82f6" opacity="0.8" />
          </>
        ) : state === "shocked" ? (
          <>
            <circle cx="35" cy="45" r="4" fill="#1f2937" />
            <circle cx="65" cy="45" r="4" fill="#1f2937" />
          </>
        ) : (
          <>
            <circle cx="35" cy="45" r="4" fill="#1f2937" />
            <circle cx="65" cy="45" r="4" fill="#1f2937" />
          </>
        )}
        
        {/* Nose */}
        <ellipse cx="50" cy="55" rx="6" ry="4" fill="#78350f" />
        
        {/* Mouth */}
        {state === "sad" ? (
          <path d="M 45 65 Q 50 60 55 65" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
        ) : state === "shocked" ? (
          <circle cx="50" cy="65" r="5" fill="#1f2937" />
        ) : (
          <path d="M 45 60 Q 50 65 55 60" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
        )}
        
        {/* Cheeks */}
        {state !== "sad" && (
          <>
            <ellipse cx="25" cy="55" rx="5" ry="3" fill="#fca5a5" opacity="0.6" />
            <ellipse cx="75" cy="55" rx="5" ry="3" fill="#fca5a5" opacity="0.6" />
          </>
        )}
      </svg>
    </div>
  );
}
