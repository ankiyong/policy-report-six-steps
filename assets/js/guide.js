/* Custom interaction for the Multiverse adaptation. No external dependencies. */
(() => {
  'use strict';
  const steps = window.PROMPT_STEPS;
  const $ = id => document.getElementById(id);
  const modal = $('prompt-dialog');
  const help = $('help-dialog');
  let active = 0, activePrompt = 0, trigger = null, copyTimer;
  let viewRevision = 0, fieldControls = [];
  const drafts = new Map();
  const builder = window.PromptBuilder;
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
      const fields = builder.getFields(prompt.text);
      drafts.set(key, { template: prompt.text, recordCount: 1, fields, values: fields.map(() => ''), result: null, hasGenerated: false, invalid: new Set(), message: '', messageError: false });
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
      ? '자료마다 원문 정보와 내 해석을 입력하세요. 자료가 여러 개면 ‘자료 추가’를 누르세요. 해석을 비우면 ‘사용자 해석 미입력’으로 표시합니다. 나머지 미확인 항목은 ‘확인 필요’라고 적어주세요.'
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
      const optionalInterpretation = isRecord && field.label === '내가 분석·해석한 내용';
      const group = create('div', 'prompt-field');
      const inputId = `input-${steps[active].id}-${steps[active].prompts[activePrompt].id}-${field.id}`;
      const label = create('label', '', field.label);
      label.htmlFor = inputId;
      const input = create('textarea', 'prompt-input');
      input.id = inputId;
      input.name = field.id;
      input.rows = 3;
      input.required = !optionalInterpretation;
      input.value = draft.values[index];
      input.placeholder = field.placeholder || '내용을 입력하거나 자료를 붙여 넣으세요.';
      const hint = create('p', 'field-hint', optionalInterpretation
        ? '직접 해석한 내용이 없으면 비워두세요. 생성 시 ‘사용자 해석 미입력’으로 표시합니다.'
        : '양식 내용이나 파일명을 적어주세요. 실제 파일은 AI 대화에 직접 첨부해야 합니다.');
      hint.id = `${inputId}-hint`;
      hint.hidden = !field.isAttachment && !optionalInterpretation;
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
      fieldControls.push({ input, error, optionalInterpretation });
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
  function showPrompt(index, focusTab = false) {
    activePrompt = index;
    const prompt = steps[active].prompts[index];
    $('prompt-title').textContent = prompt.title;
    renderFields();
    updateResult();
    $('input-scroll').scrollTop = 0;
    $('prompt-text').scrollTop = 0;
    const tabs = Array.from($('prompt-tabs').children);
    tabs.forEach((tab, i) => {tab.setAttribute('aria-selected', String(i === index));tab.tabIndex = i === index ? 0 : -1;});
    $('prompt-panel').setAttribute('aria-labelledby', tabs.length ? tabs[index].id : 'prompt-title');
    if (focusTab && tabs[index]) tabs[index].focus();
  }
  $('prompt-form').addEventListener('submit', event => {
    event.preventDefault();
    const draft = currentDraft();
    draft.invalid.clear();
    fieldControls.forEach(({ input, error, optionalInterpretation }, index) => {
      draft.values[index] = input.value;
      const missing = !optionalInterpretation && !input.value.trim();
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
      fieldControls[index].optionalInterpretation && !value.trim() ? '사용자 해석 미입력' : value));
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
    active = index;
    const step = steps[index];
    $('dialog-number').textContent = step.number;
    $('dialog-step-label').textContent = index === 0 ? 'START HERE' : `STEP ${step.number}`;
    $('dialog-kicker').textContent = index === 0 ? '공통 지침 · 모든 단계에 자동 포함' : `STEP ${step.number} / ${totalSteps}`;
    $('dialog-title').textContent = step.title;
    $('dialog-description').textContent = step.description;
    $('dialog-decision').textContent = step.decision;
    $('dialog-example').textContent = step.example;
    $('dialog-image').src = imagePath(index);
    $('prev-step').disabled = index === 0;
    $('next-step').disabled = index === steps.length - 1;
    $('step-count').textContent = index === 0 ? `START / ${totalSteps}` : `${step.number} / ${totalSteps}`;
    $('prompt-tabs').replaceChildren();
    if (step.prompts.length > 1) step.prompts.forEach((prompt, i) => {
      const tab = create('button', '', prompt.title);
      tab.type = 'button';tab.id = `tab-${step.id}-${i}`;
      tab.setAttribute('role', 'tab');tab.setAttribute('aria-controls', 'prompt-panel');
      tab.addEventListener('click', () => showPrompt(i));
      tab.addEventListener('keydown', event => {
        let target;
        if (event.key === 'ArrowRight') target = (i + 1) % step.prompts.length;
        if (event.key === 'ArrowLeft') target = (i - 1 + step.prompts.length) % step.prompts.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = step.prompts.length - 1;
        if (target !== undefined) {event.preventDefault();showPrompt(target, true);}
      });
      $('prompt-tabs').append(tab);
    });
    showPrompt(0);
    if (!modal.open) modal.showModal();
    syncScrollLock();
    $('dialog-scroll').scrollTop = 0;
    $('dialog-title').focus({preventScroll:true});
    if (updateUrl) history.pushState(null, '', `#${step.id}`);
  }
  function clearStepHash() {
    if (steps.some(s => `#${s.id}` === location.hash)) history.replaceState(null, '', location.pathname + location.search);
  }
  modal.addEventListener('close', () => { viewRevision++; resetCopy(); syncScrollLock(); clearStepHash(); if (trigger) trigger.focus({preventScroll:true}); });
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
  function fallbackCopy(text) {
    const field = create('textarea');field.value = text;field.readOnly = true;
    field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;width:1px;height:1px;';
    modal.append(field);field.focus();field.select();field.setSelectionRange(0, text.length);
    let success = false;
    try {success = document.execCommand('copy');} catch (_) { /* Manual selection below. */ }
    field.remove();$('copy-prompt').focus({preventScroll:true});return success;
  }
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
