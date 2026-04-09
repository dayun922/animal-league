import React from 'react';
import { Share2, ThumbsUp, MessageSquare } from 'lucide-react';
import { LionMascot } from './LionMascot';

export function ShareCard({ score, tier, percentile, title = "열공 모드 결과" }: { score: number, tier: string, percentile: number, title?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-sm w-full mx-auto border border-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs">
            E
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900">에브리타임</div>
            <div className="text-xs text-gray-500">방금 전 · 익명</div>
          </div>
        </div>
        <Share2 className="w-5 h-5 text-gray-400" />
      </div>
      
      {/* Content */}
      <div className="p-4 bg-gray-50 flex flex-col items-center">
        <h3 className="font-bold text-lg text-gray-800 mb-2">{title}</h3>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm w-full text-center border border-gray-100 mb-4">
          <LionMascot state={score > 300 ? "happy" : "sad"} className="w-20 h-20 mx-auto mb-2" />
          <div className="text-3xl font-black text-primary mb-1">{score}점</div>
          <div className="text-sm font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1 inline-block">
            상위 {percentile}% | {tier}
          </div>
        </div>
        
        <p className="text-gray-700 text-sm w-full text-left font-medium leading-relaxed">
          공부 빼고 다 재밌는 사람들의 대결 🎮<br/>
          제 점수 어때요? ㅋㅋ 학점은 포기했습니다.<br/>
          <span className="text-blue-500">#학점포기자 #기말고사 #종강기원</span>
        </p>
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 bg-white flex gap-4 text-gray-500 text-sm border-t border-gray-100">
        <div className="flex items-center gap-1.5 font-medium hover:text-red-500 cursor-pointer">
          <ThumbsUp className="w-4 h-4" /> 공감
        </div>
        <div className="flex items-center gap-1.5 font-medium hover:text-blue-500 cursor-pointer">
          <MessageSquare className="w-4 h-4" /> 댓글
        </div>
      </div>
    </div>
  );
}
