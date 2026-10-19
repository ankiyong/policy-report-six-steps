(() => {
  'use strict';
  if (!window.InstructorAccess?.require()) return;
  document.getElementById('instructor-logout')?.addEventListener('click', () => window.InstructorAccess.logout());
  const slides = [
  [
    "생성형 AI를 활용한 보고서 작성과 카드뉴스 제작",
    "강의 표지. 2026.10.20, 태안 정책연수원.",
    "images/lecture-uploaded-01.webp"
  ],
  [
    "강사소개",
    "강사소개 시작 화면.",
    "images/lecture-uploaded-02.webp"
  ],
  [
    "강사소개",
    "강사소개 제목 화면.",
    "images/lecture-uploaded-03.webp"
  ],
  [
    "강사소개 · 유쾌",
    "유쾌 키워드로 강사 소개.",
    "images/lecture-uploaded-04.webp"
  ],
  [
    "강사소개 · 유쾌·공감",
    "유쾌와 공감 키워드로 강사 소개.",
    "images/lecture-uploaded-05.webp"
  ],
  [
    "강사소개 · 유쾌·공감·핸섬",
    "유쾌, 공감, 핸섬 키워드로 강사 소개.",
    "images/lecture-uploaded-06.webp"
  ],
  [
    "안기용 강사",
    "강사 이름과 소개 사진.",
    "images/lecture-uploaded-07.webp"
  ],
  [
    "안기용 강사 · 경력 소개",
    "데이터 엔지니어, DevOps, 생성형 AI·대학생 진로·팀빌딩·레크레이션 강사 경력 소개.",
    "images/lecture-uploaded-08.webp"
  ],
  [
    "프롤로그",
    "PART 0. 프롤로그라는 제목으로 AI와 업무 변화에 관한 도입 강의를 시작하는 장표입니다.",
    "images/lecture-prologue-01.webp"
  ],
  [
    "반성도 AI가 대신 하는 시대",
    "ChatGPT로 시말서를 작성한 사례를 다룬 기사와 온라인 게시물을 함께 보여주는 장표입니다.",
    "images/lecture-prologue-02.webp"
  ],
  [
    "AI가 작성한 시말서 사례",
    "ChatGPT로 작성한 시말서를 검토해 달라는 온라인 게시글과 시말서 예시를 확대한 화면입니다.",
    "images/lecture-prologue-03.webp"
  ],
  [
    "시말서 작성 도우미",
    "시말서 작성 도우미의 소개와 상황별 요청 예시를 보여주는 화면입니다.",
    "images/lecture-prologue-04.webp"
  ],
  [
    "AI와 생산수단 혁신",
    "AI를 생산수단 혁신으로 소개하며 AI 기업의 매출, 인원 등 지표를 비교한 순위표 화면을 제시합니다.",
    "images/lecture-prologue-05.webp"
  ],
  [
    "소수 인원의 AI 기업",
    "AI 기업 순위표의 소개 부분을 확대하고 소수 인원으로 AI를 활용하는 스타트업에 주목하는 장표입니다.",
    "images/lecture-prologue-06.webp"
  ],
  [
    "AI와 기업 경쟁력의 변화",
    "기업별 매출과 인원 비교표를 확대하고 AI 활용이 조직 규모와 기업 경쟁력의 관계를 바꾼다는 강의 메시지를 제시합니다.",
    "images/lecture-prologue-07.webp"
  ],
  [
    "미 증시 순위 참고 자료",
    "원문에 2026년 9월로 표시된 기업 시가총액 순위표와 Trillion 단위 설명을 보여줍니다.",
    "images/lecture-prologue-08.webp"
  ],
  [
    "AI와 일자리 변화 전망",
    "세계경제포럼의 2016년 보고서 화면과 AI가 일자리에 미칠 영향에 대한 전망 문구를 제시하는 장표입니다.",
    "images/lecture-prologue-09.webp"
  ],
  [
    "인간과 일에 대한 질문",
    "인간은 원래 무엇을 하기 위해 태어난 존재인가라는 질문과 방송 인터뷰 화면을 함께 제시합니다.",
    "images/lecture-prologue-10.webp"
  ],
  [
    "로봇의 반복 업무 수행",
    "인간과 일에 관한 질문 아래 소포를 다루는 로봇의 영상 화면과 실시간 채팅을 보여줍니다.",
    "images/lecture-prologue-11.webp"
  ],
  [
    "AI 에이전트의 일정 업무 사례",
    "업무용 채팅 화면에서 캘린더 일정 확인 결과, 추가 확인 사항, 후속 작업과 승인 필요 항목을 정리한 사례입니다.",
    "images/lecture-prologue-12.webp"
  ],
  [
    "업무용 AI 에이전트 구성",
    "업무용 채팅 서비스에 연결된 여섯 개 앱 계정의 목록을 확대한 화면입니다.",
    "images/lecture-prologue-13.webp"
  ],
  [
    "일정 확인과 후속 작업 정리",
    "캘린더와 일정 관리 도구를 대조한 결과 및 후속 작업을 정리한 업무용 채팅 화면을 다시 보여줍니다.",
    "images/lecture-prologue-14.webp"
  ],
  [
    "생성형 AI의 응답 방식",
    "사람 아이콘에서 AI 로고로 향하는 화살표로 생성형 AI에 요청하는 관계를 표현한 장표입니다.",
    "images/lecture-prologue-15.webp"
  ],
  [
    "AI 에이전트의 업무 방식",
    "사람이 여러 AI 에이전트에 업무를 지시하고 결과물을 받는 관계를 화살표와 도형으로 표현합니다.",
    "images/lecture-prologue-16.webp"
  ],
  [
    "범정부 오피스 소개",
    "범정부 오피스 매뉴얼 표지와 반복 문서 편집을 간소화하는 도구라는 소개를 함께 보여줍니다.",
    "images/lecture-prologue-17.webp"
  ],
  [
    "기관별 범정부 오피스 이미지",
    "여러 공공기관 이름과 기관별로 꾸민 범정부 오피스 캐릭터 아이콘을 격자로 보여줍니다.",
    "images/lecture-prologue-18.webp"
  ],
  [
    "보고서와 기획",
    "PART 1. 보고서와 기획.",
    "images/lecture-uploaded-09.webp"
  ],
  [
    "정책보고서 작성 9단계",
    "내 문제의식 기록, 정책보고서 주제 확정, 자료 탐색과 읽을 자료 선택, 원문 확인과 근거 기록, 핵심 문제와 배경 구성, 개선방안 결정, 추진계획 결정, 기대효과와 확인 방법 결정, 초안 작성·검토·최종안. 1~8단계는 기획·선택, 9단계는 작성·검토·최종안입니다.",
    "images/lecture-02-nine-stages.png"
  ],
  [
    "AI와 보고서를 쓸수록 기획이 더 중요하다",
    "1~8단계에서 정한 목적·근거·선택이 9단계 보고서의 기준이 됩니다. 사람은 생각·근거 확인·선택을, AI는 정리·질문·대안 비교를 맡습니다. 9단계는 AI 초안 작성 → 사람의 근거·판단 검토 → AI 수정·최종안 작성 순서이며 최종 확인은 사람이 합니다. 작성·검토 중 발견한 빈틈은 해당 기획 단계로 돌아가 보완합니다.",
    "images/lecture-03-nine-stages.png"
  ],
  [
    "AI와 함께 기획하기",
    "PART 2. AI와 함께 기획하기.",
    "images/lecture-uploaded-12.webp"
  ],
  [
    "AI 활용의 출발점은 기획",
    "목적과 조건, 완료 기준을 먼저 정합니다. 기획, 자료 준비, 초안, 검토·보완의 순서.",
    "images/lecture-uploaded-13.webp"
  ],
  [
    "같은 주제, 달라지는 결과물",
    "같은 주제도 부서장 보고, 실무자 안내, 청년인턴 교육에 따라 내용과 형식이 달라집니다.",
    "images/lecture-uploaded-14.webp"
  ],
  [
    "원하는 것을 설명하는 6가지 정보",
    "목적, 독자, 배경·근거, 조건, 결과물, 판단 기준.",
    "images/lecture-uploaded-15.webp"
  ],
  [
    "막연한 요청을 구체적인 요구로",
    "목적·범위·완료 기준을 확인할 수 있는 문장으로 바꾸고 조건의 우선순위를 정합니다.",
    "images/lecture-uploaded-16.webp"
  ],
  [
    "AI를 활용한 정책보고서 작성",
    "PART 3. AI를 활용한 정책보고서 작성.",
    "images/lecture-uploaded-17.webp"
  ],
  [
    "보고서 작성 지침 생성",
    "보고서 작성의 대원칙을 생성하고 적용합니다. 프로젝트 생성, 이름 설정, 프로젝트 설정.",
    "images/lecture-uploaded-18.webp"
  ]
];
  const $ = id => document.getElementById(id);
  const player = $('slide-player');
  const stage = $('slide-stage');
  const image = $('slide-image');
  const thumbnails = $('slide-thumbnails');
  const autoplay = $('slide-autoplay');
  const fullscreen = $('slide-fullscreen');
  const status = $('player-status');
  let current = 0;
  let timer = null;
  let expanded = false;
  let previousFocus = null;
  const imagePath = index => slides[index][2];
  const keyboardHint = "포인터(Page Up·Down/방향키): 이전·다음 · 화면 클릭·터치: 다음 장 · Space·Enter: 다음 장 · Home 처음 · End 마지막";

  function stopAutoplay(message) {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
    autoplay.textContent = '자동 재생';
    autoplay.setAttribute('aria-pressed', 'false');
    if (message) status.textContent = message;
  }

  function renderSlide(index, manual = false) {
    if (manual) stopAutoplay(keyboardHint);
    current = Math.max(0, Math.min(slides.length - 1, index));
    image.src = imagePath(current);
    image.alt = `${current + 1}쪽. ${slides[current][0]}. ${slides[current][1]}`;
    $('slide-title').textContent = slides[current][0];
    $('slide-count').textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
    $('slide-prev').disabled = current === 0;
    $('slide-next').disabled = current === slides.length - 1;
    $('slide-error').hidden = true;
    [...thumbnails.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    if (current < slides.length - 1) {
      const preload = new Image();
      preload.src = imagePath(current + 1);
    }
    if (current === slides.length - 1 && timer !== null) stopAutoplay('마지막 슬라이드입니다. 자동 재생을 마쳤습니다.');
  }

  function startAutoplay() {
    stopAutoplay();
    if (current === slides.length - 1) renderSlide(0);
    const seconds = Number($('slide-interval').value);
    autoplay.textContent = '일시 정지';
    autoplay.setAttribute('aria-pressed', 'true');
    status.textContent = `${seconds}초마다 자동으로 이동합니다. 마지막 슬라이드에서 멈춥니다.`;
    timer = window.setInterval(() => renderSlide(current + 1), seconds * 1000);
  }

  slides.forEach(([title], index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'slide-thumbnail';
    button.setAttribute('aria-label', `${index + 1}쪽: ${title}`);
    button.setAttribute('aria-pressed', String(index === current));
    const thumb = document.createElement('img');
    thumb.src = imagePath(index);
    thumb.alt = '';
    thumb.width = 320;
    thumb.height = 180;
    thumb.loading = 'lazy';
    const caption = document.createElement('span');
    caption.textContent = `${String(index + 1).padStart(2, '0')} · ${title}`;
    button.append(thumb, caption);
    button.addEventListener('click', () => renderSlide(index, true));
    button.addEventListener('keydown', event => {
      const keys = {ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: slides.length - 1};
      if (!(event.key in keys) || event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      const next = Math.max(0, Math.min(slides.length - 1, keys[event.key]));
      renderSlide(next, true);
      thumbnails.children[next].focus();
    });
    thumbnails.append(button);
  });

  $('slide-prev').addEventListener('click', () => renderSlide(current - 1, true));
  $('slide-next').addEventListener('click', () => renderSlide(current + 1, true));
  autoplay.addEventListener('click', () => timer === null ? startAutoplay() : stopAutoplay(`자동 재생을 멈췄습니다. ${keyboardHint}`));
  $('slide-interval').addEventListener('change', () => { if (timer !== null) startAutoplay(); });
  image.addEventListener('error', () => { $('slide-error').hidden = false; stopAutoplay('이미지 로딩을 확인해주세요. 통합 PDF로도 강의를 진행할 수 있습니다.'); });
  // One click event covers mouse, touch and pen without a second pointerup advance.
  stage.addEventListener('click', event => {
    if ((event.button !== undefined && event.button !== 0) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('a,button,input,select,textarea,summary,[contenteditable="true"]')) return;
    stage.focus({preventScroll: true});
    renderSlide(current + 1, true);
    if (current === slides.length - 1) status.textContent = `마지막 슬라이드입니다. ${keyboardHint}`;
  });

  function syncFullscreenButton() {
    const isFullscreen = document.fullscreenElement === player || expanded;
    fullscreen.setAttribute('aria-pressed', String(isFullscreen));
    fullscreen.textContent = isFullscreen ? '전체 화면 종료' : '⛶ 전체 화면';
  }

  function setExpanded(value) {
    expanded = value;
    player.classList.toggle('is-expanded', value);
    document.body.classList.toggle('expanded-player-open', value);
    player.setAttribute('role', value ? 'dialog' : 'region');
    if (value) player.setAttribute('aria-modal', 'true');
    else player.removeAttribute('aria-modal');
    syncFullscreenButton();
    if (value) {
      status.textContent = '브라우저에서 화면을 크게 펼쳤습니다. Esc 또는 전체 화면 종료로 돌아갑니다.';
      stage.focus({preventScroll: true});
    } else {
      status.textContent = keyboardHint;
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus({preventScroll: true});
    }
  }

  fullscreen.addEventListener('click', async () => {
    if (expanded) { setExpanded(false); return; }
    if (document.fullscreenElement === player) {
      try { await document.exitFullscreen(); } catch (_) { status.textContent = '브라우저의 Esc 키로 전체 화면을 종료할 수 있습니다.'; }
      return;
    }
    previousFocus = document.activeElement;
    if (player.requestFullscreen) {
      try { await player.requestFullscreen(); stage.focus({preventScroll: true}); syncFullscreenButton(); return; } catch (_) { /* Expand in-page when browser fullscreen is unavailable. */ }
    }
    setExpanded(true);
  });
  document.addEventListener('fullscreenchange', syncFullscreenButton);
  document.addEventListener('visibilitychange', () => { if (document.hidden && timer !== null) stopAutoplay('화면을 벗어나 자동 재생을 멈췄습니다.'); });
  window.addEventListener('pagehide', () => stopAutoplay());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && expanded) { event.preventDefault(); setExpanded(false); return; }
    if (event.key === 'Tab' && expanded) {
      const focusable = [stage, $('slide-prev'), $('slide-next'), $('slide-interval'), autoplay, fullscreen].filter(element => !element.disabled);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !player.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !player.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
      return;
    }

  });
  window.LectureNavigation.register({player, stage, navigate: action => {
    const fromThumbnail = thumbnails.contains(document.activeElement);
    renderSlide(action === 'first' ? 0 : action === 'last' ? slides.length - 1 : current + action, true);
    if (fromThumbnail) thumbnails.children[current].focus({preventScroll: true});
  }});
  renderSlide(0);
})();
