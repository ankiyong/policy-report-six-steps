/* Custom interaction for the Multiverse adaptation. No external dependencies. */
(() => {
  'use strict';
  const steps = window.PROMPT_STEPS;
  const $ = id => document.getElementById(id);
  const modal = $('prompt-dialog');
  const help = $('help-dialog');
  let active = 0, activePrompt = 0, trigger = null, copyTimer;
  let activeView = 'guide', activeInputPrompt = 0, initialized = false;
  let viewRevision = 0, fieldControls = [];
  const drafts = new Map();
  const guideScrolls = new Map();
  const writingGuides = window.WRITING_GUIDES;
  const builder = window.PromptBuilder;
  const instructor = new URLSearchParams(location.search).get('mode') === 'instructor' ? window.INSTRUCTOR_CASE : null;
  const exampleScrolls = new Map();
  if (instructor) {
    $('instructor-banner').hidden = false;
    $('instructor-notice').textContent = `${instructor.topic} · ${instructor.notice} 입력·결정은 수정할 수 있으며 새로고침하면 원래 예시로 돌아갑니다.`;
  }
  const imagePath = index => `images/steps/${steps[index].id}.webp`;
  const create = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };
  const totalSteps = String(steps.length - 1).padStart(2, '0');
  steps.forEach((step, index) => {
    const article = create('article', 'thumb');
    const link = create('a', 'card-link');
    link.href = `#${step.id}`;
    link.setAttribute('aria-label', `${index === 0 ? '시작하기' : index + '단계'}, ${step.title} 프롬프트 열기`);
    const img = create('img', 'card-image');
    img.src = imagePath(index); img.alt = ''; img.decoding = 'async';
    img.loading = index < 4 ? 'eager' : 'lazy';
    const top = create('div', 'card-top');
    top.append(create('span', 'card-step', index === 0 ? 'START · 00' : `STEP ${step.number}`));
    if (index === 0) top.append(create('span', 'prompt-count', '먼저 읽기'));
    else if (step.prompts.length > 1) top.append(create('span', 'prompt-count', step.badge || '단계 · 내 결정'));
    const content = create('div', 'card-content');
    const row = create('div', 'card-title-row');
    const arrow = create('span', 'card-arrow', '↗'); arrow.setAttribute('aria-hidden', 'true');
    row.append(create('h2', '', step.title), arrow);
    content.append(create('p', 'card-subtitle', step.eyebrow), row, create('p', 'card-description', step.subtitle));
    link.append(img, top, content); article.append(link); $('main').append(article);
    link.addEventListener('click', event => { event.preventDefault(); trigger = link; openStep(index, true); });
  });
  function syncScrollLock() { document.body.classList.toggle('modal-open', modal.open || help.open); }
  function currentDraft() {
    const prompt = steps[active].prompts[activePrompt];
    const key = `${steps[active].id}:${prompt.id}`;
    if (!drafts.has(key)) {
      const example = instructor?.prompts[prompt.id];
      const recordCount = example?.records?.length || 1;
      const template = prompt.repeatSection ? builder.expandRepeatSection(prompt.text, recordCount, prompt.repeatSection) : prompt.text;
      const fields = builder.getFields(template);
      const values = fields.map(field => example ? (prompt.repeatSection && field.section === prompt.repeatSection ? example.records?.[field.recordIndex]?.[field.label] : example.values[field.label]) || '' : '');
      drafts.set(key, { template, recordCount, fields, values, result: example ? builder.build(template, values) : null, hasGenerated: !!example, invalid: new Set(), message: example ? '교육용 입력 예시가 채워져 있습니다. 그대로 복사하거나 수정 후 다시 생성하세요.' : '', messageError: false });
    }
    return drafts.get(key);
  }
  function resetCopy() {
    clearTimeout(copyTimer);
    $('copy-status').textContent = '';
    $('copy-prompt').classList.remove('copied');
    $('copy-prompt').innerHTML = '<span aria-hidden="true">▣</span> 프롬프트 복사';
  }
  function updateResult() {
    const prompt = steps[active].prompts[activePrompt];
    const draft = currentDraft();
    const hasFields = draft.fields.length > 0;
    const ready = !hasFields || draft.result !== null;
    viewRevision++;
    resetCopy();
    $('copy-prompt').disabled = !ready;
    $('prompt-text').textContent = draft.result === null ? draft.template : draft.result;
    $('output-title').textContent = !hasFields ? '프롬프트' : ready ? '02 · 완성된 프롬프트' : '02 · 기본 템플릿';
    $('output-hint').textContent = !hasFields ? '그대로 복사해 AI 대화에 붙여 넣으세요.' : ready ? '입력한 내용이 반영되었습니다. 확인 후 복사하세요.' : '입력 항목을 채우고 프롬프트를 생성하면 복사할 수 있습니다.';
    $('input-progress').textContent = `${draft.values.filter(value => value.trim()).length} / ${draft.fields.length} 항목 입력`;
    $('generation-status').textContent = draft.message;
    $('generation-status').classList.toggle('is-error', draft.messageError);
  }
  function renderFields() {
    const draft = currentDraft();
    $('prompt-fields').replaceChildren();
    fieldControls = [];
    $('prompt-form').hidden = draft.fields.length === 0;
    $('prompt-panel').classList.toggle('is-readonly', draft.fields.length === 0);
    const prompt = steps[active].prompts[activePrompt];
    $('prompt-instruction').textContent = prompt.instruction || (prompt.kind === 'main'
      ? '내 정보 입력 → 프롬프트 생성 → 복사 · 공통 지침 자동 포함'
      : prompt.kind === 'decision'
        ? 'AI 답변을 검토한 뒤 작성 → 진행 중인 채팅에 붙여 넣기 → 결과 요약 갱신'
        : '모든 단계 프롬프트에 자동으로 포함되는 공통 지침입니다.');
    const preparations = prompt.preparations || steps[active].preparations || [];
    $('preparation-panel').hidden = prompt.kind === 'decision' || preparations.length === 0;
    $('preparation-panel').open = false;
    $('preparation-title').textContent = `준비할 자료·정보 (${preparations.length})`;
    $('preparation-list').replaceChildren(...preparations.map(item => create('li', '', item)));
    $('add-record').hidden = !prompt.repeatSection;
    $('input-help').textContent = prompt.repeatSection
      ? '자료별로 출처와 내가 분석한 내용을 입력하세요. 원문은 AI 채팅에 직접 첨부하면 발행정보를 AI가 확인합니다. 자료가 여러 개면 ‘자료 추가’를 누르세요. 분석을 비우면 ‘사용자 분석 미입력’으로 표시합니다.'
      : '각 항목을 입력하세요. 아직 모르면 ‘확인 필요’, 해당하지 않으면 ‘해당 없음’을 적어주세요.';
    const recordContainers = new Map();
    let lastSection = '';
    draft.fields.forEach((field, index) => {
      let container = $('prompt-fields');
      const isRecord = prompt.repeatSection && field.section === prompt.repeatSection;
      if (isRecord) {
        if (!recordContainers.has(field.recordIndex)) {
          const record = create('fieldset', 'research-record');
          record.append(create('legend', '', `자료 ${field.recordIndex + 1}`));
          const remove = create('button', 'record-remove', `자료 ${field.recordIndex + 1} 삭제`);
          remove.id = `remove-record-${field.recordIndex}`;
          remove.type = 'button';
          remove.disabled = draft.recordCount === 1;
          remove.addEventListener('click', () => changeRecords(field.recordIndex));
          record.append(remove);
          container.append(record);
          recordContainers.set(field.recordIndex, record);
        }
        container = recordContainers.get(field.recordIndex);
      } else if (prompt.repeatSection && field.section !== lastSection) {
        container.append(create('h5', 'field-section-title', field.section));
      }
      lastSection = field.section;
      const optionalAnalysis = isRecord && field.label === '내가 분석한 내용';
      const group = create('div', 'prompt-field');
      const inputId = `input-${steps[active].id}-${steps[active].prompts[activePrompt].id}-${field.id}`;
      const label = create('label', '', field.label);
      label.htmlFor = inputId;
      const input = create('textarea', 'prompt-input');
      input.id = inputId;
      input.name = field.id;
      input.rows = 3;
      input.required = !optionalAnalysis;
      input.value = draft.values[index];
      input.placeholder = field.placeholder || '내용을 입력하거나 자료를 붙여 넣으세요.';
      const fieldHint = writingGuides[prompt.id]?.fieldHints[field.label];
      const hint = create('p', 'field-hint', optionalAnalysis
        ? '직접 분석한 내용이 없으면 비워두세요. 생성 시 ‘사용자 분석 미입력’으로 표시합니다.'
        : field.isAttachment ? '양식 내용이나 파일명을 적어주세요. 실제 파일은 AI 대화에 직접 첨부해야 합니다.' : fieldHint || '');
      hint.id = `${inputId}-hint`;
      hint.hidden = !field.isAttachment && !optionalAnalysis && !fieldHint;
      const error = create('p', 'field-error', '이 항목을 입력해주세요. 모르면 ‘확인 필요’라고 적을 수 있습니다.');
      error.id = `${inputId}-error`;
      error.hidden = !draft.invalid.has(index);
      input.setAttribute('aria-invalid', String(draft.invalid.has(index)));
      input.setAttribute('aria-describedby', `input-help ${!hint.hidden ? hint.id + ' ' : ''}${error.id}`);
      input.addEventListener('input', () => {
        draft.values[index] = input.value;
        draft.result = null;
        if (input.value.trim()) draft.invalid.delete(index);
        input.setAttribute('aria-invalid', String(draft.invalid.has(index)));
        error.hidden = !draft.invalid.has(index);
        draft.message = draft.hasGenerated ? '입력 내용이 변경되었습니다. 프롬프트 생성을 다시 눌러주세요.' : '';
        draft.messageError = false;
        updateResult();
      });
      group.append(label, input, hint, error);
      container.append(group);
      fieldControls.push({ input, error, optionalAnalysis });
    });
  }
  function changeRecords(removeIndex) {
    const prompt = steps[active].prompts[activePrompt];
    const draft = currentDraft();
    if (!prompt.repeatSection || (removeIndex !== undefined && draft.recordCount === 1)) return;
    const indices = draft.fields.map((field, index) => ({ field, index }))
      .filter(({ field }) => field.section === prompt.repeatSection);
    const fieldsPerRecord = indices.length / draft.recordCount;
    if (removeIndex === undefined) {
      draft.values.splice(indices[indices.length - 1].index + 1, 0, ...Array(fieldsPerRecord).fill(''));
      draft.recordCount++;
    } else {
      const first = indices.find(({ field }) => field.recordIndex === removeIndex);
      if (!first) return;
      draft.values.splice(first.index, fieldsPerRecord);
      draft.recordCount--;
    }
    draft.template = builder.expandRepeatSection(prompt.text, draft.recordCount, prompt.repeatSection);
    draft.fields = builder.getFields(draft.template);
    draft.result = null;
    draft.invalid.clear();
    draft.message = `자료 ${draft.recordCount}개를 입력할 수 있습니다. 내용을 확인하고 프롬프트를 생성하세요.`;
    draft.messageError = false;
    renderFields();
    updateResult();
    const targetRecord = removeIndex === undefined ? draft.recordCount - 1 : Math.min(removeIndex, draft.recordCount - 1);
    const target = draft.fields.findIndex(field => field.section === prompt.repeatSection && field.recordIndex === targetRecord);
    if (target >= 0) fieldControls[target].input.focus();
  }
  $('add-record').addEventListener('click', () => changeRecords());
  function rememberScroll() {
    if (!initialized) return;
    const prompt = steps[active].prompts[activePrompt];
    if (activeView === 'guide') {
      guideScrolls.set(prompt.id, { guide: $('guide-scroll').scrollTop || 0, outer: $('dialog-scroll').scrollTop || 0 });
    } else if (activeView === 'example') {
      exampleScrolls.set(prompt.id, { text: $('example-text').scrollTop || 0, outer: $('dialog-scroll').scrollTop || 0 });
    } else {
      currentDraft().scroll = { input: $('input-scroll').scrollTop || 0, output: $('prompt-text').scrollTop || 0, outer: $('dialog-scroll').scrollTop || 0 };
    }
  }
  function renderGuide() {
    const step = steps[active];
    const prompt = step.prompts[activeInputPrompt];
    const guide = writingGuides[prompt.id];
    if (!guide) return;
    $('guide-goal').textContent = guide.goal;
    $('guide-rules').replaceChildren(...guide.rules.map((rule, index) => {
      const item = create('li');
      const number = create('span', 'guide-rule-number', String(index + 1).padStart(2, '0'));
      number.setAttribute('aria-hidden', 'true');
      const content = create('div');
      content.append(create('h4', '', rule.title), create('p', '', rule.text), create('span', 'guide-field-tag', rule.fields));
      item.append(number, content);
      return item;
    }));
    const caseValues = instructor?.prompts[prompt.id]?.values;
    const examples = caseValues ? Object.entries(caseValues).slice(0, 3).map(([label, text]) => ({title: label, items: [{label: '인수인계 사례', text: text.length > 280 ? text.slice(0, 280) + '… (전체 내용은 입력·프롬프트에서 확인)' : text}]})) : guide.examples;
    $('guide-examples').replaceChildren(...examples.map(example => {
      const section = create('section', 'guide-example');
      section.append(create('h4', '', example.title));
      const list = create('dl');
      example.items.forEach(item => list.append(create('dt', '', item.label), create('dd', '', item.text)));
      section.append(list);
      return section;
    }));
    $('guide-checkpoints').replaceChildren(...guide.checkpoints.map(item => create('li', '', item)));
    $('guide-preparation-list').replaceChildren(...(prompt.preparations || step.preparations || []).map(item => create('li', '', item)));
  }
  function showView(view, focusTab = false) {
    rememberScroll();
    activeView = active === 0 ? 'input' : view === 'example' && !instructor ? 'guide' : view;
    activePrompt = activeView === 'decision' ? steps[active].prompts.findIndex(prompt => prompt.kind === 'decision') : activeInputPrompt;
    const prompt = steps[active].prompts[activePrompt];
    $('prompt-title').textContent = prompt.title;
    renderFields();
    updateResult();
    renderGuide();
    $('guide-panel').hidden = activeView !== 'guide';
    $('prompt-panel').hidden = activeView === 'guide' || activeView === 'example';
    $('example-panel').hidden = activeView !== 'example';
    $('example-status').textContent = '';
    $('copy-example').disabled = false;
    if (instructor && active > 0) {
      const sample = instructor.prompts[prompt.id];
      const decision = steps[active].prompts.find(item => item.kind === 'decision');
      // The investigation plan precedes the completed analysis and final adoption decision.
      const decisionResult = prompt.kind !== 'research-plan' && prompt.kind !== 'decision' ? instructor.prompts[decision.id]?.result : '';
      $('example-title').textContent = active === 6 ? '완성 정책보고서 · 최종 점검' : `${steps[active].number} · ${prompt.title} 작성 결과`;
      $('example-text').textContent = `${instructor.notice}\n\n${sample?.result || ''}${decisionResult ? '\n\n━━━━━━━━━━━━━━━━━━━━\n내 결정 반영 결과\n\n' + decisionResult : ''}`;
    }
    $('review-guide').hidden = active === 0 || activeView === 'decision';
    $('view-tabs').hidden = active === 0;
    $('prompt-tabs').hidden = activeView === 'decision' || $('prompt-tabs').children.length < 2;
    Array.from($('view-tabs').children).forEach(tab => {
      const selected = tab.id === `view-${activeView}-tab`;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    Array.from($('prompt-tabs').children).forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === activeInputPrompt)));
    $('prompt-panel').setAttribute('aria-labelledby', active === 0 ? 'prompt-title' : `view-${activeView === 'decision' ? 'decision' : 'input'}-tab`);
    const scroll = currentDraft().scroll || {};
    const guideScroll = guideScrolls.get(prompt.id) || {};
    const exampleScroll = exampleScrolls.get(prompt.id) || {};
    $('input-scroll').scrollTop = scroll.input || 0;
    $('prompt-text').scrollTop = scroll.output || 0;
    $('guide-scroll').scrollTop = guideScroll.guide || 0;
    $('example-text').scrollTop = exampleScroll.text || 0;
    $('dialog-scroll').scrollTop = (activeView === 'guide' ? guideScroll.outer : activeView === 'example' ? exampleScroll.outer : scroll.outer) || 0;
    initialized = true;
    if (focusTab) $(`view-${activeView}-tab`).focus({preventScroll:true});
  }
  $('start-writing').addEventListener('click', () => { showView('input'); $('prompt-title').focus({preventScroll:true}); });
  $('review-guide').addEventListener('click', () => { showView('guide'); $('guide-title').focus({preventScroll:true}); });
  $('prompt-form').addEventListener('submit', event => {
    event.preventDefault();
    const draft = currentDraft();
    draft.invalid.clear();
    fieldControls.forEach(({ input, error, optionalAnalysis }, index) => {
      draft.values[index] = input.value;
      const missing = !optionalAnalysis && !input.value.trim();
      if (missing) draft.invalid.add(index);
      input.setAttribute('aria-invalid', String(missing));
      error.hidden = !missing;
    });
    if (draft.invalid.size) {
      draft.result = null;
      draft.message = `아직 입력하지 않은 항목이 ${draft.invalid.size}개 있습니다. 표시된 항목을 채워주세요.`;
      draft.messageError = true;
      updateResult();
      fieldControls[[...draft.invalid][0]].input.focus();
      return;
    }
    draft.result = builder.build(draft.template, draft.values.map((value, index) =>
      fieldControls[index].optionalAnalysis && !value.trim() ? '사용자 분석 미입력' : value));
    draft.hasGenerated = true;
    draft.message = steps[active].prompts[activePrompt].kind === 'decision'
      ? '내 결정문을 완성했습니다. 진행 중인 AI 채팅에 붙여 넣어 결과 요약을 갱신하세요.'
      : steps[active].prompts[activePrompt].repeatSection || steps[active].prompts[activePrompt].kind === 'research-plan'
        ? '프롬프트를 완성했습니다. 복사해 진행 중인 AI 채팅에 이어서 붙여 넣으세요.'
        : '공통 지침을 포함한 프롬프트를 완성했습니다. 확인하고 복사하세요.';
    draft.messageError = false;
    updateResult();
    $('prompt-text').scrollTop = 0;
    $('output-title').focus();
  });
  function openStep(index, updateUrl = false) {
    rememberScroll();
    initialized = false;
    active = index;
    activeInputPrompt = 0;
    activePrompt = 0;
    const step = steps[index];
    $('dialog-kicker').textContent = index === 0 ? '공통 지침 · 모든 단계에 자동 포함' : `STEP ${step.number} / ${totalSteps}`;
    $('dialog-title').textContent = step.title;
    $('dialog-description').textContent = step.subtitle;
    $('dialog-decision').textContent = step.decision;
    $('dialog-image').src = imagePath(index);
    $('prev-step').disabled = index === 0;
    $('next-step').disabled = index === steps.length - 1;
    $('step-count').textContent = index === 0 ? `START / ${totalSteps}` : `${step.number} / ${totalSteps}`;
    $('view-tabs').replaceChildren();
    const views = [['guide', '작성 요령'], ['input', '입력·프롬프트'], ['decision', '내 결정 기록']];
    if (instructor) views.push(['example', index === 6 ? '완성 보고서' : '완성 예시']);
    if (index > 0) views.forEach(([view, title], i) => {
      const tab = create('button', '', title);
      tab.id = `view-${view}-tab`; tab.type = 'button';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', view === 'guide' ? 'guide-panel' : view === 'example' ? 'example-panel' : 'prompt-panel');
      tab.addEventListener('click', () => showView(view));
      tab.addEventListener('keydown', event => {
        let target;
        if (event.key === 'ArrowRight') target = (i + 1) % views.length;
        if (event.key === 'ArrowLeft') target = (i - 1 + views.length) % views.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = views.length - 1;
        if (target !== undefined) { event.preventDefault(); showView(views[target][0], true); }
      });
      $('view-tabs').append(tab);
    });
    $('prompt-tabs').replaceChildren();
    const processes = step.prompts.filter(prompt => prompt.kind !== 'decision');
    if (processes.length > 1) processes.forEach((prompt, i) => {
      const tab = create('button', '', prompt.title);
      tab.type = 'button';tab.id = `tab-${step.id}-${i}`;
      tab.setAttribute('aria-controls', instructor ? 'guide-panel prompt-panel example-panel' : 'guide-panel prompt-panel');
      tab.addEventListener('click', () => { activeInputPrompt = i; showView(activeView); });
      $('prompt-tabs').append(tab);
    });
    if (!modal.open) modal.showModal();
    showView(index === 0 ? 'input' : instructor ? (index === 6 ? 'example' : 'input') : 'guide');
    syncScrollLock();
    $('dialog-scroll').scrollTop = 0;
    $('dialog-title').focus({preventScroll:true});
    if (updateUrl) history.pushState(null, '', `#${step.id}`);
  }
  function clearStepHash() {
    if (steps.some(s => `#${s.id}` === location.hash)) history.replaceState(null, '', location.pathname + location.search);
  }
  modal.addEventListener('close', () => { rememberScroll(); viewRevision++; resetCopy(); syncScrollLock(); clearStepHash(); if (trigger) trigger.focus({preventScroll:true}); });
  help.addEventListener('close', syncScrollLock);
  $('close-prompt').addEventListener('click', () => modal.close());
  $('close-help').addEventListener('click', () => help.close());
  $('help-button').addEventListener('click', () => {help.showModal();syncScrollLock();});
  [modal, help].forEach(dialog => dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  }));
  $('prev-step').addEventListener('click', () => {if(active > 0) openStep(active - 1, true);});
  $('next-step').addEventListener('click', () => {if(active < steps.length - 1) openStep(active + 1, true);});
  function fallbackCopy(text, buttonId = 'copy-prompt') {
    const field = create('textarea');field.value = text;field.readOnly = true;
    field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;width:1px;height:1px;';
    modal.append(field);field.focus();field.select();field.setSelectionRange(0, text.length);
    let success = false;
    try {success = document.execCommand('copy');} catch (_) { /* Manual selection below. */ }
    field.remove();$(buttonId).focus({preventScroll:true});return success;
  }
  $('copy-example').addEventListener('click', async () => {
    if (!instructor || activeView !== 'example') return;
    const text = $('example-text').textContent;
    const revision = viewRevision;
    $('copy-example').disabled = true;
    let success = false;
    if (window.isSecureContext && navigator.clipboard) {
      try { await navigator.clipboard.writeText(text); success = true; } catch (_) { /* Fallback below. */ }
    }
    if (revision !== viewRevision || !modal.open) return;
    $('copy-example').disabled = false;
    if (!success) success = fallbackCopy(text, 'copy-example');
    $('example-status').textContent = success ? '작성 결과를 복사했습니다. 교육용 예시임을 함께 표시해 사용하세요.' : '자동 복사가 제한되어 내용을 선택했습니다. Ctrl+C 또는 ⌘C로 복사하세요.';
    if (!success) {
      const range = document.createRange(); range.selectNodeContents($('example-text'));
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    }
  });
  $('copy-prompt').addEventListener('click', async () => {
    const draft = currentDraft();
    if (draft.fields.length && draft.result === null) return;
    const text = draft.result === null ? steps[active].prompts[activePrompt].text : draft.result;
    const revision = viewRevision;
    $('copy-prompt').disabled = true;
    let success = false;
    if (window.isSecureContext && navigator.clipboard) {
      try {await navigator.clipboard.writeText(text);success = true;} catch (_) { /* Try local-file fallback. */ }
    }
    // A slow clipboard request must not update or select text in a different prompt.
    if (revision !== viewRevision || !modal.open) return;
    $('copy-prompt').disabled = false;
    if (!success) success = fallbackCopy(text);
    if (success) {
      $('copy-prompt').textContent = '✓ 복사 완료';$('copy-prompt').classList.add('copied');
      $('copy-status').textContent = steps[active].prompts[activePrompt].kind === 'decision'
        ? '복사했습니다. 진행 중인 AI 채팅에 붙여 넣어 결과 요약을 갱신하세요.'
        : '복사했습니다. 진행 중인 AI 채팅에 이어서 붙여 넣으세요.';
      copyTimer = setTimeout(() => {$('copy-prompt').innerHTML = '<span aria-hidden="true">▣</span> 프롬프트 복사';$('copy-prompt').classList.remove('copied');}, 2500);
    } else {
      const range = document.createRange();range.selectNodeContents($('prompt-text'));
      const selection = window.getSelection();selection.removeAllRanges();selection.addRange(range);
      $('copy-status').textContent = '자동 복사가 제한되어 내용을 선택했습니다. Ctrl+C 또는 ⌘C로 복사하세요. 모바일에서는 길게 눌러 복사하세요.';
    }
  });
  function handleHash() {
    const index = steps.findIndex(step => `#${step.id}` === location.hash);
    if (index >= 0) openStep(index);
    else if (modal.open) modal.close();
  }
  window.addEventListener('popstate', handleHash);
  window.addEventListener('hashchange', handleHash);
  handleHash();
})();
