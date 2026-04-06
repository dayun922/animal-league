import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LionMascot } from '../components/LionMascot';
import { ShareCard } from '../components/ShareCard';

const TAUNTS_QUOTES = [
  "천재는 1%의 영감과 99%의 노력으로 이루어진다. 근데 넌 둘 다 없네?",
  "잠을 자면 꿈을 꾸지만, 공부를 안 하면 꿈이 사라진다. (방금 사라짐)",
  "시작이 반이다. 나머지는 네가 안 해서 영원히 시작 상태일 뿐.",
  "고통 없이는 얻는 것도 없다. 근데 넌 고통만 있고 얻는 건 F네?",
  "늦었다고 생각할 때가 가장 빠른 때다. 아니, 이번 시험은 진짜 늦었어. 포기해.",
  "피할 수 없으면 즐겨라. 근데 재수강은 즐기기 좀 힘들 텐데?",
  "실패는 성공의 어머니이다. 축하해, 이번에 어머니를 한 분 더 모시게 됐구나.",
  "내일은 내일의 태양이 뜬다. 그리고 네 성적표엔 해 대신 비가 내리겠지.",
  "지식에 투자하는 것이 가장 높은 이자를 배당한다. 네 통장은 이미 지식 파산 상태인 것 같은데?",
  "세 살 버릇 여든까지 간다. 지금 폰질 하는 거 보니 환갑 때도 이러고 있을 듯.",
  "기회는 준비된 자에게 온다. 기회가 네 옆을 지나가다 너 보고 그냥 가더라.",
  "당신의 능력을 믿으세요. 아, 방금 확인해보니 믿을 게 별로 없네요. 미안.",
  "한 번의 실패가 영원한 패배는 아니다. 근데 이번 학점은 영원히 기록에 남는다.",
  "꿈을 크게 가져라. 깨질 때 조각도 크니까 치우기 힘들게.",
  "배움에는 끝이 없다. 그래서 넌 이번 전공을 다음 학기에 또 배우게 될 거야.",
];

const TAUNTS_FACTS = [
  "지금 이 명언 읽을 시간에 전공책 1페이지라도 더 봤으면 F는 면했다.",
  "어차피 재수강할 거면 지금 그냥 자는 게 효율적이지 않을까?",
  "옆에 사자는 지금 3회독째라는데, 넌 폰이랑 아이컨택 중?",
  "와, 이걸 아직도 읽고 있어? 진짜 공부하기 싫은가 보다.",
  "네 경쟁자는 지금 이 앱 안 깔고 공부하고 있어.",
  "부모님이 너 공부하는 줄 알고 보내주신 용돈, 이 앱 하는 데 쓰고 있니?",
  "교수님은 이미 네 학점을 결정하셨어. 너만 모르고 있을 뿐.",
  "지금 네 뇌세포들이 주인을 잘못 만나서 단체 파업 중이래.",
  "이 화면의 검은색은 네 미래고, 흰색 글씨는 네가 놓친 정답이야.",
  "너 방금 폰 켤 때 '딱 5분만 봐야지'라고 생각했지? 벌써 10분 지남.",
  "학점은 1점대, 열정은 0점대, 폰질은 만점대.",
  "솔직히 말해봐. 지금 이 멘트들 캡처해서 에타에 올릴 생각 하고 있지?",
  "네가 공부 안 해도 세상은 잘 돌아가. 다만 네 성적표만 안 돌아올 뿐.",
  "이 앱 만든 나도 지금 공부 안 하고 이거 썼는데, 너까지 이러면 어떡하니?",
  "5초 뒤에 자동으로 꺼질 거야. 아, 구라고. 5분 채워야 함. 다시 집중해.",
];

const ALL_TAUNTS = [...TAUNTS_QUOTES, ...TAUNTS_FACTS];

export default function Game4() {
  const { updateScore, tier, percentile } = useGame();
  
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'END'>('IDLE');
  const [timeLeft, setTimeLeft] = useState(300);
  const [penalties, setPenalties] = useState(0);
  const [taunt, setTaunt] = useState(ALL_TAUNTS[0]);
  const [tauntIndex, setTauntIndex] = useState(0);
  const [showDistraction, setShowDistraction] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [worstTaunt, setWorstTaunt] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tauntTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ignoreNextEventRef = useRef(false);
  const shownTauntsRef = useRef<number[]>([]);

  const getNextTaunt = () => {
    if (shownTauntsRef.current.length >= ALL_TAUNTS.length) {
      shownTauntsRef.current = [];
    }
    let idx: number;
    do {
      idx = Math.floor(Math.random() * ALL_TAUNTS.length);
    } while (shownTauntsRef.current.includes(idx));
    shownTauntsRef.current.push(idx);
    return ALL_TAUNTS[idx];
  };

  const startGame = () => {
    shownTauntsRef.current = [];
    const first = getNextTaunt();
    setGameState('PLAYING');
    setTimeLeft(300);
    setPenalties(0);
    setTaunt(first);
    setTauntIndex(0);
    setWorstTaunt(first);
    ignoreNextEventRef.current = true;
    setTimeout(() => { ignoreNextEventRef.current = false; }, 1500);
  };

  const handleEndGame = useCallback((currentPenalties: number, currentTaunt: string) => {
    setGameState('END');
    const score = Math.max(0, 500 - currentPenalties * 10);
    setFinalScore(score);
    updateScore('game4', score);
    setWorstTaunt(currentTaunt);
    if (timerRef.current) clearInterval(timerRef.current);
    if (tauntTimerRef.current) clearInterval(tauntTimerRef.current);
  }, [updateScore]);

  const penaltiesRef = useRef(0);
  const tauntRef = useRef(ALL_TAUNTS[0]);

  useEffect(() => {
    penaltiesRef.current = penalties;
  }, [penalties]);

  useEffect(() => {
    tauntRef.current = taunt;
  }, [taunt]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            handleEndGame(penaltiesRef.current, tauntRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      tauntTimerRef.current = setInterval(() => {
        const next = getNextTaunt();
        setTaunt(next);
        setTauntIndex(i => i + 1);
      }, 10000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (tauntTimerRef.current) clearInterval(tauntTimerRef.current);
    };
  }, [gameState, handleEndGame]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const handleDistraction = () => {
      if (ignoreNextEventRef.current || showDistraction) return;
      
      setPenalties(p => p + 1);
      setTimeLeft(t => t + 10);
      setShowDistraction(true);
      
      ignoreNextEventRef.current = true;
      setTimeout(() => { 
        setShowDistraction(false); 
        ignoreNextEventRef.current = false;
      }, 2000);
    };

    window.addEventListener('mousemove', handleDistraction);
    window.addEventListener('click', handleDistraction);
    window.addEventListener('keydown', handleDistraction);
    window.addEventListener('touchstart', handleDistraction);

    return () => {
      window.removeEventListener('mousemove', handleDistraction);
      window.removeEventListener('click', handleDistraction);
      window.removeEventListener('keydown', handleDistraction);
      window.removeEventListener('touchstart', handleDistraction);
    };
  }, [gameState, showDistraction]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isQuoteStyle = TAUNTS_QUOTES.includes(taunt);

  return (
    <div className={`min-h-[100dvh] w-full flex flex-col transition-colors duration-1000 ${gameState === 'PLAYING' ? 'bg-black' : 'bg-slate-50'}`}>
      {gameState !== 'PLAYING' && (
        <div className="p-4 flex items-center z-10 absolute top-0 left-0">
          <Link href="/select">
            <button data-testid="btn-back" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100">
              <ChevronLeft className="w-6 h-6 text-slate-800" />
            </button>
          </Link>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden w-full max-w-md mx-auto">
        
        {gameState === 'IDLE' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full"
          >
            <div className="mb-6">
              <LionMascot state="happy" className="w-32 h-32 mx-auto drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-black mb-2 text-emerald-600">열공 모드</h1>
            <p className="text-emerald-800/70 font-bold mb-1 text-lg">화이트 노이즈</p>
            <p className="mb-8 text-slate-500 leading-relaxed px-2">
              5분 동안 당신의 집중력을 테스트합니다.<br/>
              <b className="text-slate-700">핸드폰을 내려놓고 명언을 음미하세요.</b><br/>
              <span className="text-xs text-red-500">마우스/터치 시 +10초 패널티!</span>
            </p>
            <button 
              data-testid="btn-start-study"
              onClick={startGame}
              className="bg-emerald-500 text-white font-bold py-4 w-full rounded-2xl text-xl shadow-[0_6px_0_rgb(4,120,87)] hover:bg-emerald-600 active:translate-y-[6px] active:shadow-none transition-all"
            >
              Start Study
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center relative px-6">
            <div className="absolute top-6 left-0 right-0 flex justify-between items-center px-6">
              <div className="text-slate-600 font-mono text-sm opacity-70">
                방해 횟수: {penalties}회
              </div>
              <div className="text-slate-500 font-mono text-xs opacity-50">
                #{tauntIndex + 1}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={taunt}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 0.85, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                transition={{ duration: 1.5 }}
                className="text-center w-full mb-16"
              >
                {isQuoteStyle ? (
                  <p className="text-white/75 text-lg leading-relaxed font-light"
                     style={{ fontFamily: 'Georgia, "Noto Serif KR", serif' }}>
                    &ldquo;{taunt}&rdquo;
                  </p>
                ) : (
                  <p className="text-white/80 text-base leading-relaxed"
                     style={{ fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 300 }}>
                    {taunt}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            <div className={`text-8xl font-mono transition-all duration-300 select-none ${showDistraction ? 'text-red-500 scale-90' : 'text-white/90'}`}
                 style={{ fontFamily: 'Georgia, serif', fontWeight: 200 }}>
              {formatTime(timeLeft)}
            </div>

            <AnimatePresence>
              {showDistraction && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="text-red-400 font-black text-2xl px-8 py-5 border-2 border-red-500/60 rounded-3xl bg-black/90 backdrop-blur-md text-center max-w-xs mx-4">
                    집중력이 부족하군요!<br/>
                    <span className="text-red-300 text-lg font-normal">+10초 추가됩니다</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {gameState === 'END' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center py-10"
          >
            <div className="mb-4">
              <LionMascot state={penalties > 3 ? "sad" : "happy"} className="w-28 h-28 mx-auto drop-shadow-xl" />
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-1">수행 완료!</h2>
            <p className="text-slate-500 text-center mb-6 px-4 font-medium">
              {penalties === 0
                ? "오오... 진짜 집중했나요? 설마 자리 비운 건 아니죠?"
                : "5분 참느라 고생했다! 근데 공부는 1분도 안 했죠?"}
            </p>

            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 w-full mb-6">
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="text-3xl font-black text-slate-800">{finalScore}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">최종 점수</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-red-500">{penalties}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">방해 횟수</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-emerald-600">{penalties === 0 ? "✓" : "✗"}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">집중 여부</div>
                </div>
              </div>
              {penalties > 0 && (
                <div className="bg-slate-50 rounded-2xl p-3 text-center">
                  <div className="text-xs text-slate-400 mb-1">오늘의 팩폭</div>
                  <p className="text-slate-600 text-sm italic leading-relaxed">
                    "{worstTaunt}"
                  </p>
                </div>
              )}
            </div>

            <ShareCard 
              score={finalScore} 
              tier={tier} 
              percentile={percentile} 
              title={penalties === 0 ? "인간승리 인증 🏆" : "의지박약 사자 인증 🦁"} 
            />

            <div className="w-full mt-6 flex flex-col gap-3">
              <button 
                data-testid="btn-share-everytime"
                className="w-full bg-[#f91b37] text-white py-4 rounded-xl font-bold shadow-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  const text = `나 방금 학점 포기자 '열공 모드' ${penalties}번 방해받으면서 ${finalScore}점 받음ㅋㅋ\n"${worstTaunt}"\n#학점포기자 #에타`;
                  navigator.clipboard?.writeText(text).catch(() => {});
                }}
              >
                에브리타임에 자랑하기 (복사됨)
              </button>
              <button 
                data-testid="btn-retry"
                onClick={startGame}
                className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold shadow-md hover:bg-slate-900 transition-colors"
              >
                다시 수양하기
              </button>
              <Link href="/" className="w-full">
                <button data-testid="btn-home" className="w-full bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                  홈으로
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
