(() => {
  'use strict';
  if (!window.InstructorAccess?.require()) return;
  document.getElementById('instructor-logout')?.addEventListener('click', () => window.InstructorAccess.logout());
  const slides = [{"label":"OPENING · 0–10분","title":"생각은 내가.<br>정리는 AI와.","lead":"주제와 판단은 사람이 정하고,<br>AI는 정리·질문·비교·작성을 돕습니다.","cards":[["오늘의 결과물","내 선택과 근거가 담긴 기획 기록과 정책보고서"],["실습 사례","가상 A기관 신규 청년인턴의 첫 행사 안내문 자료 탐색 개선"]],"takeaway":"180분 · 정규 9단계 · Claude 스킬 추가는 선택 부록","tone":"opening"},{"label":"COMMON RULES · 도입","title":"답을 받기 전에,<br>내 생각부터 적습니다.","lead":"새 입력은 최대 3개. 추가 내용은 ‘그 외 기타 사항’에 적습니다.","cards":[["사람의 역할","경험 쓰기 → 원문 읽기 → 대안 선택 → 이유 설명 → 최종 확인"],["AI의 역할","생각 정리 → 필요한 질문 → 보완안 비교 → 선택 반영"]],"takeaway":"경험·사실·가설·제안·확인 필요를 구분하고, 없는 수치·출처·협의 결과를 만들지 않습니다."},{"label":"01 · 10–20분","title":"내 문제의식에서<br>출발하기","lead":"관심 주제·선정 이유·직접 본 현상을 내 말로 적습니다.","cards":[["경험·이유·장면 쓰기","내가 겪은 구체적인 업무 장면을 먼저 씁니다."],["현상과 추측 구분","AI가 경험·원인 가설·영향을 구분하고 필요한 정보만 질문합니다."]],"takeaway":"개인 경험을 조직 전체의 문제로 확대하지 않은 기획 기록"},{"label":"02 · 20–30분","title":"보고서의 주제를<br>명확하게 정하기","lead":"1단계 기록을 이어받아 대상·업무·포함·제외 범위를 좁힙니다.","cards":[["내 선택과 이유","주제안과 범위를 유지·수정하고 이유를 설명합니다."],["완료 결과","주제명 1개 · 한 문장 설명 · 포함/제외 범위 · 추가 확인 사항"]],"takeaway":"이미 쓴 대상과 경험은 다시 입력하지 않습니다."},{"label":"03 · 30–40분","title":"주장을 확인할<br>자료 찾기","lead":"내 생각을 뒷받침하거나 바꾸게 할 자료를 찾습니다.","cards":[["먼저 정할 질문","확인할 주장 · 현재 대응 · 내 생각에서 의심되는 부분"],["AI의 자료 추천","원문·공식 자료 최대 3개. 출처·위치·읽을 목적을 확인합니다."]],"takeaway":"추천 자료는 직접 읽기 전까지 ‘검토 전’입니다."},{"label":"04 · 40–60분","title":"원문을 읽고<br>내 근거 기록 만들기","lead":"내가 먼저 읽고 2~3문장으로 요약한 뒤 AI와 대조합니다.","cards":[["자료마다 세 항목","읽은 자료·위치 / 내 요약 / 내 문제·주장과의 연결"],["내 활용 판단","이미 추천된 자료는 번호·위치를 재사용하고 채택·수정·보류와 이유를 선택합니다."]],"takeaway":"원문을 열지 못했다면 읽은 것으로 표시하지 않습니다."},{"label":"05 · 60–75분","title":"핵심 문제와<br>추진 배경 정리하기","lead":"채택한 근거와 내 판단으로 왜 개선이 필요한지 설명합니다.","cards":[["사람이 판단","우선 해결할 문제 · 원인이라고 보는 것 · 우리 기관이 다룰 이유"],["AI가 점검","현행 대응·공백·원인 가설·문제 규모와 근거의 연결을 확인합니다."]],"takeaway":"근거가 부족한 부분은 확인 과제로 남깁니다. 이후 10분 휴식."},{"label":"06 · 85–110분","title":"개선방안은<br>내가 선택합니다.","lead":"기대하는 변화와 선택 기준을 먼저 적습니다. 아이디어는 없어도 됩니다.","cards":[["아이디어가 있다면","내 안을 포함해 2~3개 대안을 같은 기준으로 비교합니다."],["아이디어가 공란이면","서로 다른 아이디어 5개를 추천받고 선택·수정·조합한 이유를 말합니다."]],"takeaway":"선택한 개선방안과 실제 인력 확보·협의·효과 확인을 구분합니다."},{"label":"07 · 110–130분","title":"어떤 순서로,<br>누가, 언제 해볼까요?","lead":"진행 순서 · 함께할 사람과 맡길 일 · 준비·적용 시기와 기간","cards":[["모두 공란이면","같은 개선방안의 추진계획 2안을 비교하고 내가 선택합니다."],["일부만 공란이면","내 입력을 유지하고 빈 부분에 필요한 선택지만 추천받습니다."]],"takeaway":"선택 후 단계·할 일·역할·시점·완료 기준 표와 자원·갱신·위험·점검을 확인합니다."},{"label":"08 · 130–145분","title":"기대효과를<br>확인 가능한 변화로","lead":"무엇을 만들었는지와 대상에게 어떤 변화가 생겼는지는 다릅니다.","cards":[["내가 고를 것","대상에게 생겨야 할 변화 · 확인 방법 · 효과에 필요한 조건"],["AI와 점검","지표·자료·시점·담당·해석 한계를 연결하고 측정 업무를 추진계획에 넣습니다."]],"takeaway":"근거 없는 개선율을 만들지 않습니다. 전체 점검 상태를 확인하고 기획을 넘깁니다."},{"label":"09 · 145–175분","title":"내 기획과 첨부 양식으로<br>초안에서 최종안까지","lead":"AI가 작성 → 사람이 근거와 판단 검토 → AI가 수정·최종 편집","cards":[["AI의 작성","기획 기록·채택한 근거·실제 양식을 연결해 네 본문 항목을 작성합니다."],["사람의 검토","내 판단과 다른 내용, 근거 없는 수치·담당·일정·원인 단정을 찾아 수정합니다."]],"takeaway":"실제 파일을 직접 열어 표·분량·쪽 나눔·출처를 확인합니다."},{"label":"WORKED EXAMPLE · 시연","title":"같은 개선방안,<br>두 가지 추진계획","lead":"대표 폴더 지정 + 권장 양식·예시 표시를 유지하며 비교합니다.","cards":[["담당자 검토 후 시험","권장본 확인 → 폴더·표시 준비 → 담당자 검토 → 첫 업무 시험"],["사용자 사전 확인 후 시험","권장본 확인 → 폴더·표시 준비 → 사전 탐색 → 보완 → 시험"]],"takeaway":"시연의 선택: 1안에 실제 폴더 접근 확인 추가. 담당·권한·작업시간·일정은 실제 협의 전 제안입니다."},{"label":"CLOSING · 175–180분","title":"내가 바꾼 판단을<br>한 가지 설명해 봅니다.","lead":"처음 생각에서 무엇이 바뀌었고, 어떤 근거로 선택했나요?","cards":[["마지막 확인","주제·문제·개선방안·추진계획·기대효과가 하나의 흐름으로 연결되는가?"],["선택 부록","필요하면 Claude 스킬을 등록하고 실제 사용할 수 있는 문서 작성 기능을 확인합니다."]],"takeaway":"AI가 쓴 문장에도 설명할 수 있는 근거와 나의 선택이 남아 있어야 합니다."}];
  const $ = id => document.getElementById(id);
  const player = $('slide-player');
  const stage = $('slide-stage');
  const content = $('slide-content');
  const thumbnails = $('slide-thumbnails');
  const autoplay = $('slide-autoplay');
  const fullscreen = $('slide-fullscreen');
  const status = $('player-status');
  let current = 0;
  let timer = null;
  let expanded = false;
  let previousFocus = null;
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
    const slide = slides[current];
    content.className = 'lecture-slide' + (slide.tone ? ' ' + slide.tone : '');
    content.innerHTML = '<p class="slide-kicker">'+slide.label+'</p><h4>'+slide.title+'</h4><p class="slide-lead">'+slide.lead+'</p><div class="slide-cards">'+slide.cards.map(card=>'<div><h5>'+card[0]+'</h5><p>'+card[1]+'</p></div>').join('')+'</div><p class="slide-takeaway">'+slide.takeaway+'</p>';
    $('slide-title').textContent = slide.title.replace(/<br>/g,' ');
    $('slide-count').textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
    $('slide-prev').disabled = current === 0;
    $('slide-next').disabled = current === slides.length - 1;
    [...thumbnails.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
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

  slides.forEach((slide, index) => {
    const title = slide.title.replace(/<br>/g,' ');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'slide-thumbnail';
    button.setAttribute('aria-label', `${index + 1}쪽: ${title}`);
    button.setAttribute('aria-pressed', String(index === current));
    const thumb = document.createElement('strong');
    thumb.textContent = String(index + 1).padStart(2,'0');
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
  // One click event covers mouse, touch and pen without a second pointerup advance.
  stage.addEventListener('click', event => {
    if ((event.button !== undefined && event.button !== 0) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('a,button,input,select,textarea,summary,[contenteditable="true"]')) return;
    if (window.getSelection()?.toString()) return;
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
