export interface SharePayload {
  gameName: string;
  scoreLabel: string;    // 예: "123번 클릭" | "A+" | "850점"
  detail?: string;       // 부가 정보 (예: "반응속도 212ms")
  nickname: string;
  schoolName: string;
  gameUrl?: string;
}

function buildText(p: SharePayload): string {
  const url = p.gameUrl ?? window.location.origin + import.meta.env.BASE_URL;
  return [
    `🎓 [학점 포기자] 게임 결과 공개`,
    ``,
    `게임: ${p.gameName}`,
    `결과: ${p.scoreLabel}${p.detail ? `  (${p.detail})` : ''}`,
    `닉네임: ${p.nickname} | ${p.schoolName}`,
    ``,
    `나도 도전해봐! 👇`,
    url,
    ``,
    `#학점포기자 #대학생활 #미니게임`,
  ].join('\n');
}

/**
 * Web Share API 지원 → 네이티브 공유 시트 (에브리타임 앱 선택 가능)
 * 미지원 → 클립보드 복사
 * 반환값: 'shared' | 'copied' | 'error'
 */
export async function shareToEverytime(p: SharePayload): Promise<'shared' | 'copied' | 'error'> {
  const text = buildText(p);
  const url  = p.gameUrl ?? window.location.origin + import.meta.env.BASE_URL;

  if (navigator.share) {
    try {
      await navigator.share({
        title: '학점 포기자 게임 결과',
        text,
        url,
      });
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'error'; // 사용자가 취소
    }
  }

  // 클립보드 복사 fallback
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    // execCommand fallback (구형 브라우저)
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return 'copied';
  }
}
