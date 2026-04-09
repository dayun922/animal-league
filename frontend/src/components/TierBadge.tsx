import React from 'react';
import { motion } from 'framer-motion';

export function TierBadge({ tier, percentile, className = "" }: { tier: string, percentile: number, className?: string }) {
  // Determine style based on tier name
  let bgClass = "bg-orange-500 text-white";
  let animation = {};
  
  if (tier === "제적 위기") {
    bgClass = "bg-slate-800 text-red-400 border-2 border-red-500";
    animation = { x: [-2, 2, -2, 2, 0], transition: { repeat: Infinity, duration: 0.5 } };
  } else if (tier === "학사경고") {
    bgClass = "bg-red-500 text-white";
    animation = { x: [-1, 1, -1, 1, 0], transition: { repeat: Infinity, duration: 1 } };
  } else if (tier === "재수강러") {
    bgClass = "bg-yellow-500 text-slate-900";
  } else if (tier === "C학점 생존자") {
    bgClass = "bg-emerald-500 text-white";
  } else if (tier === "B급 인재") {
    bgClass = "bg-teal-500 text-white";
  } else if (tier === "A학점 도전자") {
    bgClass = "bg-blue-500 text-white";
  } else if (tier === "장학금 수령자") {
    bgClass = "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]";
    animation = { y: [-2, 2, -2], transition: { repeat: Infinity, duration: 2 } };
  } else if (tier === "명예 교수") {
    bgClass = "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white shadow-[0_0_20px_rgba(251,191,36,0.8)] border border-yellow-300";
    animation = { 
      scale: [1, 1.05, 1],
      boxShadow: ["0px 0px 10px rgba(251,191,36,0.5)", "0px 0px 25px rgba(251,191,36,0.9)", "0px 0px 10px rgba(251,191,36,0.5)"],
      transition: { repeat: Infinity, duration: 1.5 } 
    };
  }

  return (
    <motion.div 
      className={`inline-flex flex-col items-center justify-center px-4 py-2 rounded-2xl font-bold ${bgClass} ${className}`}
      animate={animation}
    >
      <div className="text-xs opacity-90 mb-1">상위 {percentile}%</div>
      <div className="text-xl tracking-tight">{tier}</div>
    </motion.div>
  );
}
