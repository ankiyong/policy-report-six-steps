(() => {
  'use strict';
  if (!window.InstructorAccess?.require()) return;
  const $ = id => document.getElementById('cardnews-' + id);
  const player = $('player');
  if (!player) return;
  const stage = $('stage');
  const image = $('image');
  const thumbnails = $('thumbnails');
  const fullscreen = $('fullscreen');
  const status = $('status');
  const titles = [
    '보고서를 이미지로 만들기',
    '보고서를 한 장의 포스터로',
    '보고서 기반 포스터 생성 4단계',
    '핵심 내용 추출',
    '구성 정하기',
    '이미지 생성',
    '원문과 대조'
  ];
  const keyboardHint = "포인터(Page Up·Down/방향키): 이전·다음 · 화면 클릭·터치: 다음 장 · Space·Enter: 다음 장 · Home 처음 · End 마지막";
  let current = 0;
  let expanded = false;
  let previousFocus = null;
  const imagePath = index => 'images/card-news-' + (index + 33) + '.webp';

  function renderSlide(index) {
    current = Math.max(0, Math.min(titles.length - 1, index));
    $('error').hidden = true;
    image.src = imagePath(current);
    image.alt = '원문 ' + (current + 33) + '쪽. ' + titles[current];
    $('title').textContent = titles[current];
    $('count').textContent = String(current + 1).padStart(2, '0') + ' / 07';
    $('prev').disabled = current === 0;
    $('next').disabled = current === titles.length - 1;
    [...thumbnails.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    status.textContent = (current === titles.length - 1 ? '마지막 슬라이드입니다. ' : '') + keyboardHint;
    if (current < titles.length - 1) {
      const preload = new Image();
      preload.src = imagePath(current + 1);
    }
  }

  titles.forEach((title, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'slide-thumbnail';
    button.setAttribute('aria-label', '원문 ' + (index + 33) + '쪽: ' + title);
    button.setAttribute('aria-pressed', String(index === current));
    const thumb = document.createElement('img');
    thumb.src = imagePath(index);
    thumb.alt = '';
    thumb.width = 320;
    thumb.height = 180;
    thumb.loading = 'lazy';
    const caption = document.createElement('span');
    caption.textContent = '원문 ' + (index + 33) + '쪽 · ' + title;
    button.append(thumb, caption);
    button.addEventListener('click', () => renderSlide(index));
    button.addEventListener('keydown', event => {
      const keys = {ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: titles.length - 1};
      if (!(event.key in keys) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      const next = Math.max(0, Math.min(titles.length - 1, keys[event.key]));
      renderSlide(next);
      thumbnails.children[next].focus();
    });
    thumbnails.append(button);
  });
  $('prev').addEventListener('click', () => renderSlide(current - 1));
  $('next').addEventListener('click', () => renderSlide(current + 1));
  image.addEventListener('error', () => {
    $('error').hidden = false;
    status.textContent = '이미지 로딩을 확인해주세요. PDF 원문으로도 강의를 진행할 수 있습니다.';
  });
  stage.addEventListener('click', event => {
    if ((event.button !== undefined && event.button !== 0) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('a,button,input,select,textarea,summary,[contenteditable="true"]')) return;
    stage.focus({preventScroll: true});
    renderSlide(current + 1);
  });

  function syncFullscreenButton() {
    const active = document.fullscreenElement === player || expanded;
    fullscreen.setAttribute('aria-pressed', String(active));
    fullscreen.textContent = active ? '전체 화면 종료' : '⛶ 전체 화면';
  }
  function setExpanded(value) {
    expanded = value;
    player.classList.toggle('is-expanded', value);
    document.body.classList.toggle('expanded-player-open', !!document.querySelector('.slide-player.is-expanded'));
    player.setAttribute('role', value ? 'dialog' : 'region');
    if (value) player.setAttribute('aria-modal', 'true');
    else player.removeAttribute('aria-modal');
    syncFullscreenButton();
    if (value) {
      status.textContent = '브라우저에서 화면을 크게 펼쳤습니다. Esc 또는 전체 화면 종료로 돌아갑니다.';
      stage.focus({preventScroll: true});
    } else {
      status.textContent = keyboardHint;
      previousFocus?.focus({preventScroll: true});
    }
  }
  fullscreen.addEventListener('click', async () => {
    if (expanded) { setExpanded(false); return; }
    if (document.fullscreenElement === player) {
      try { await document.exitFullscreen(); } catch (_) {
        status.textContent = '브라우저의 Esc 키로 전체 화면을 종료할 수 있습니다.';
      }
      return;
    }
    previousFocus = document.activeElement;
    if (player.requestFullscreen) {
      try {
        await player.requestFullscreen();
        stage.focus({preventScroll: true});
        syncFullscreenButton();
        return;
      } catch (_) { /* Use an in-page fullscreen fallback when unavailable. */ }
    }
    setExpanded(true);
  });
  document.addEventListener('fullscreenchange', syncFullscreenButton);

  // Keep fullscreen focus handling here; presenter navigation is shared.
  player.addEventListener('keydown', event => {
    if (event.key === 'Escape' && expanded) {
      event.preventDefault();
      setExpanded(false);
      return;
    }
    if (event.key === 'Tab' && expanded) {
      const focusable = [stage, $('prev'), $('next'), fullscreen].filter(element => !element.disabled);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }

  });
  window.LectureNavigation.register({player, stage, navigate: action => {
    const fromThumbnail = thumbnails.contains(document.activeElement);
    renderSlide(action === 'first' ? 0 : action === 'last' ? titles.length - 1 : current + action);
    if (fromThumbnail) thumbnails.children[current].focus({preventScroll: true});
  }});
  renderSlide(0);
})();
