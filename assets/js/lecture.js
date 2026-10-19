(() => {
  'use strict';
  if (!window.InstructorAccess?.require()) return;
  document.getElementById('instructor-logout')?.addEventListener('click', () => window.InstructorAccess.logout());
  const slides = [
    ['보고서와 기획', 'PART 1. 보고서와 기획'],
    ['정책보고서 작성 9단계', '1 내 문제의식 기록, 2 정책보고서 주제 확정, 3 자료 탐색과 읽을 자료 선택, 4 원문 확인과 근거 기록, 5 핵심 문제와 배경 구성, 6 개선방안 결정, 7 추진계획 결정, 8 기대효과와 확인 방법 결정, 9 초안 작성·검토·최종안. 1~8단계는 기획·선택, 9단계는 초안 작성·검토·최종안입니다.'],
    ['AI와 보고서를 쓸수록 기획이 더 중요하다', '1~8단계에서 정한 목적·근거·선택이 9단계 보고서의 기준이 됩니다. 사람은 생각·근거 확인·선택을, AI는 정리·질문·대안 비교를 맡습니다. 9단계는 AI 초안 작성 → 사람의 근거·판단 검토 → AI 수정·최종안 작성 순서이며 최종 확인은 사람이 합니다.'],
    ['AI와 함께 기획하기', 'PART 2. AI와 함께 기획하기'],
    ['AI 활용의 출발점은 기획', '목적과 조건, 완료 기준을 먼저 정합니다. 기획, 자료 준비, 초안, 검토·보완의 순서에서 사람은 목적·조건 설정, 근거 확인과 최종 판단을 맡습니다.'],
    ['같은 주제, 달라지는 결과물', '업무 인계·인수 개선이라는 같은 주제도 부서장 보고, 실무자 안내, 청년인턴 교육에 따라 필요한 내용과 형식이 달라집니다.'],
    ['원하는 것을 설명하는 6가지 정보', '목적, 독자, 배경·근거, 조건, 결과물, 판단 기준을 항목별로 분명하게 정리합니다.'],
    ['막연한 요청을 구체적인 요구로', '목적·범위·완료 기준을 확인할 수 있는 문장으로 바꾸고, 조건의 우선순위를 정합니다.'],
    ['AI를 활용한 정책보고서 작성', 'PART 3. AI를 활용한 정책보고서 작성'],
    ['보고서 작성 지침 생성', '보고서 작성의 대원칙을 생성하고 적용합니다. 프로젝트 생성, 프로젝트 이름 설정, 프로젝트 설정의 화면 예시입니다.']
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
  const updatedSlideImages = {1: 'images/lecture-02-nine-stages.png', 2: 'images/lecture-03-nine-stages.png'};
  const imagePath = index => updatedSlideImages[index] || `images/lecture-${String(index + 1).padStart(2, '0')}.webp`;
  const keyboardHint = '화면 클릭·터치: 다음 장 · ← → / Page Up·Down: 이동 · Space·Enter: 다음 장 · Home 처음 · End 마지막';

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
  image.addEventListener('error', () => { $('slide-error').hidden = false; stopAutoplay('이미지 로딩을 확인해주세요. PDF 원본으로도 강의를 진행할 수 있습니다.'); });
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
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target;
    if (target.closest && target.closest('button,a,input,select,textarea,summary,[contenteditable="true"]')) return;
    if (target !== document.body && !stage.contains(target)) return;
    const keys = {ArrowLeft: current - 1, ArrowRight: current + 1, PageUp: current - 1, PageDown: current + 1,
      ' ': current + 1, Enter: current + 1, Home: 0, End: slides.length - 1};
    if (!(event.key in keys)) return;
    event.preventDefault();
    renderSlide(keys[event.key], true);
  });
  renderSlide(0);
})();
