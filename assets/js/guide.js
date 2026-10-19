/* Custom interaction for the Multiverse adaptation. No external dependencies. */
(() => {
  'use strict';
  const requestedInstructor = new URLSearchParams(location.search).get('mode') === 'instructor';
  if (requestedInstructor && !window.InstructorAccess?.require()) return;
  const instructor = requestedInstructor ? window.INSTRUCTOR_CASE : null;
  const setup = window.SKILL_SETUP;
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
  const exampleScrolls = new Map();
  document.body.classList.toggle('is-instructor', !!instructor);
  if (instructor) {
    document.title = '정책보고서부터 카드뉴스까지 | 강사용 10단계 실습';
    $('intro-title').innerHTML = '정책보고서부터 <span>카드뉴스까지.</span>';
    $('intro-note').innerHTML = '1~8단계는 사람이 생각하고 선택합니다.<br><strong>9단계는 AI와 양식에 맞춰 작성·검토합니다.</strong><br>10단계는 한 장 카드뉴스·포스터로 만듭니다.';
    $('intro-eyebrow').innerHTML = '<span class="green-dot"></span> AI WORKSHOP · TEN-STEP CHAT GUIDE';
    $('page-brand-count').textContent = '10단계 실습 + 부록';
    $('main').setAttribute('aria-label', '공통 원칙과 보고서·카드뉴스 10단계, 선택 부록');
    $('prompts-download').href = 'prompts.txt';
    document.querySelectorAll('.instructor-only').forEach(element => { element.hidden = false; });
    $('instructor-logout').hidden = false;
    $('instructor-logout').addEventListener('click', () => window.InstructorAccess.logout());
    $('instructor-banner').hidden = false;
    $('instructor-notice').textContent = `${instructor.topic} · ${instructor.notice} 입력·결정은 수정할 수 있으며 새로고침하면 원래 예시로 돌아갑니다.`;
  }
  const imagePath = index => steps[index].image || `images/steps/${steps[index].id}.webp`;
  const create = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };
  $('setup-title').textContent = setup.title;
  $('setup-description').textContent = setup.description;
  $('setup-note').textContent = setup.note;
  $('skill-name').textContent = 'hwpx-writer';
  $('skill-description').textContent = setup.descriptionForSkill;
  $('skill-instructions').textContent = setup.instructions;
  $('setup-check-text').textContent = setup.verificationPrompt;
  $('download-skill-instructions').href = setup.instructionFile;
  $('setup-steps').replaceChildren(...setup.steps.map((item, index) => {
    const row = create('li');
    row.append(create('span', 'setup-number', String(index + 1).padStart(2, '0')));
    const content = create('div');
    content.append(create('h4', '', item.title), create('p', '', item.text));
    row.append(content);
    return row;
  }));
  $('setup-sources').replaceChildren(...setup.sources.map(source => {
    const link = create('a', '', source.title + ' ↗');
    link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    return link;
  }));
  const totalSteps = String(steps.filter(step => /^step-\d+$/.test(step.id)).length).padStart(2, '0');
  steps.forEach((step, index) => {
    const article = create('article', step.isAppendix ? 'thumb appendix-card' : 'thumb');
    const link = create('a', 'card-link');
    link.href = `#${step.id}`;
    link.setAttribute('aria-label', `${index === 0 ? '시작하기' : step.isAppendix ? '선택 부록' : Number(step.number) + '단계'}, ${step.title} 프롬프트 열기`);
    const img = create('img', 'card-image');
    img.src = imagePath(index); img.alt = ''; img.decoding = 'async';
    img.loading = index < 4 ? 'eager' : 'lazy';
    const top = create('div', 'card-top');
    top.append(create('span', 'card-step', index === 0 ? 'START · 00' : step.isAppendix ? 'APPENDIX · 선택' : `STEP ${step.number}`));
    if (index === 0) top.append(create('span', 'prompt-count', '먼저 읽기'));
    else if (step.badge || step.prompts.length > 1) top.append(create('span', 'prompt-count', step.badge || '단계 · 내 결정'));
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
      const example = instructor?.prompts?.[prompt.id];
      const recordCount = example?.records?.length || 1;
      const template = prompt.repeatSection ? builder.expandRepeatSection(prompt.text, recordCount, prompt.repeatSection) : prompt.text;
      const fields = builder.getFields(template);
      const values = fields.map(field => example ? (prompt.repeatSection && field.section === prompt.repeatSection ? example.records?.[field.recordIndex]?.[field.label] : example.values?.[field.label]) || '' : '');
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
    $('output-hint').textContent = !hasFields ? '그대로 복사해 AI 대화에 붙여 넣으세요.' : ready ? '입력한 내용이 반영되었습니다. 확인 후 복사하세요.' : '필수 항목을 확인하고 생성하세요. 선택 항목은 비워 둘 수 있습니다.';
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
    $('prompt-instruction').textContent = prompt.instruction || (prompt.kind?.startsWith('cardnews-') ? 'PDF 강의안을 바탕으로 정리한 실습용 프롬프트 · 원문은 PDF 원문 탭에서 복사' : prompt.kind === 'main'
      ? '내 정보 입력 → 프롬프트 생성 → 복사 · 공통 지침 자동 포함'
      : prompt.kind === 'decision'
        ? 'AI 답변을 검토한 뒤 작성 → 진행 중인 채팅에 붙여 넣기 → 결과 요약 갱신'
        : '보고서 작성 1~9단계에 포함되는 공통 지침입니다.');
    const preparations = prompt.preparations || steps[active].preparations || [];
    $('preparation-panel').hidden = prompt.kind === 'decision' || preparations.length === 0;
    $('preparation-panel').open = false;
    $('preparation-title').textContent = `준비할 자료·정보 (${preparations.length})`;
    $('preparation-list').replaceChildren(...preparations.map(item => create('li', '', item)));
    $('add-record').hidden = !prompt.repeatSection;
    $('input-help').textContent = prompt.inputHelp || '필수 항목에 내 생각을 적으세요. 선택 항목은 비워 둘 수 있습니다.';
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
      const optional = (prompt.optionalFields || []).includes(field.label) || field.label.includes('기타 사항');
      const group = create('div', 'prompt-field');
      const inputId = `input-${steps[active].id}-${steps[active].prompts[activePrompt].id}-${field.id}`;
      const label = create('label', '', field.label + (optional && !field.label.includes('선택') ? ' (선택)' : ''));
      label.htmlFor = inputId;
      const input = create('textarea', 'prompt-input');
      input.id = inputId;
      input.name = field.id;
      input.rows = 3;
      input.required = !optional;
      input.value = draft.values[index];
      input.placeholder = field.placeholder || '내용을 입력하거나 자료를 붙여 넣으세요.';
      const fieldHint = writingGuides[prompt.id]?.fieldHints?.[field.label];
      const hint = create('p', 'field-hint', fieldHint || (optional ? '선택 입력입니다. 모르는 내용은 비워 두세요.' : field.isAttachment ? '실제 파일은 AI 채팅에 직접 첨부하세요.' : ''));
      hint.id = `${inputId}-hint`;
      hint.hidden = !field.isAttachment && !optional && !fieldHint;
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
      fieldControls.push({ input, error, optional });
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
    } else if (['example', 'decision-example'].includes(activeView)) {
      exampleScrolls.set(prompt.id, { text: $('example-text').scrollTop || 0, outer: $('dialog-scroll').scrollTop || 0 });
    } else if (!['setup', 'source'].includes(activeView)) {
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
    const caseValues = instructor?.prompts?.[prompt.id]?.values;
    const examples = caseValues && Object.keys(caseValues).length ? Object.entries(caseValues).slice(0, 3).map(([label, text]) => ({title: label, items: [{label: '청년인턴 가상 사례', text: text.length > 280 ? text.slice(0, 280) + '… (전체 내용은 입력·프롬프트에서 확인)' : text}]})) : guide.examples;
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
    activeView = active === 0 ? 'input' : ['example', 'decision-example'].includes(view) && !instructor ? 'guide' : view;
    const decisionIndex = steps[active].prompts.findIndex(prompt => prompt.kind === 'decision');
    if (['decision', 'decision-example'].includes(activeView) && decisionIndex < 0) activeView = 'input';
    activePrompt = ['decision', 'decision-example'].includes(activeView) ? decisionIndex : activeInputPrompt;
    const prompt = steps[active].prompts[activePrompt];
    const isWorkflow = prompt.kind === 'document-workflow';
    if (activeView === 'source' && !prompt.sourceText) activeView = 'input';
    $('source-panel').hidden = activeView !== 'source';
    $('source-title').textContent = 'PDF 원문 프롬프트 · ' + (prompt.sourcePage || '') + '쪽';
    $('source-note').textContent = prompt.sourceNote ? '실습용 프롬프트의 보완 사항: ' + prompt.sourceNote : '';
    $('source-text').textContent = prompt.sourceText || '';
    $('source-pdf-link').href = prompt.sourceUrl || 'card-news-lecture.pdf';
    $('source-status').textContent = '';
    $('copy-source').disabled = !prompt.sourceText;
    $('start-writing').innerHTML = isWorkflow ? '프롬프트 확인하기 <span aria-hidden="true">→</span>' : '이해했어요, 입력 시작하기 <span aria-hidden="true">→</span>';
    $('prompt-title').textContent = prompt.title;
    renderFields();
    updateResult();
    renderGuide();
    $('guide-panel').hidden = activeView !== 'guide';
    $('prompt-panel').hidden = activeView === 'guide' || ['example', 'decision-example'].includes(activeView) || activeView === 'setup' || activeView === 'source';
    $('example-panel').hidden = !['example', 'decision-example'].includes(activeView);
    $('example-panel').setAttribute('aria-labelledby', activeView === 'decision-example' ? 'view-decision-example-tab' : 'view-example-tab');
    $('setup-panel').hidden = activeView !== 'setup';
    $('setup-status').textContent = '';
    ['copy-skill-name', 'copy-skill-description', 'copy-skill-instructions', 'copy-skill-check'].forEach(id => { $(id).disabled = false; });
    $('example-status').textContent = '';
    $('copy-example').disabled = false;
    if (instructor && active > 0) {
      const sample = instructor.prompts[prompt.id];
      $('example-title').textContent = activeView === 'decision-example' ? '수강생 선택 후 기록 · 별도 시연' : isWorkflow ? 'Claude 양식 작성 진행 예시' : prompt.kind === 'report-outline' ? '개요 초안 · 확정 전 검토'
        : prompt.kind === 'report-body' ? '본문 초안 · 최종 점검' : `${steps[active].number} · ${prompt.title} 작성 결과`;
      $('example-hint').textContent = activeView === 'decision-example' ? '가상 수강생이 선택과 이유를 입력한 뒤의 기록입니다. 앞선 추천만으로 자동 확정되는 내용이 아닙니다.' : isWorkflow ? '최신 초안과 빈 HWPX 양식을 Claude에 첨부하는 교육용 진행 예시입니다. 실제 문서 작성·검증·다운로드는 hwpx-writer 스킬을 사용할 수 있는 Claude에서 진행합니다.' : '미리 준비한 교육용 예시입니다. 입력을 수정해도 이 결과는 바뀌지 않습니다.';
      $('copy-example').textContent = isWorkflow ? '진행 예시 복사' : '작성 결과 복사';
      $('example-text').textContent = instructor.notice + '\n\n' + (sample?.result || '');
    }
    $('review-guide').hidden = active === 0 || ['decision', 'decision-example'].includes(activeView) || prompt.kind === 'skill-setup';
    $('view-tabs').hidden = active === 0;
    $('prompt-tabs').hidden = ['decision', 'decision-example'].includes(activeView) || $('prompt-tabs').children.length < 2;
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
    $('dialog-scroll').scrollTop = (activeView === 'guide' ? guideScroll.outer : ['example', 'decision-example'].includes(activeView) ? exampleScroll.outer : scroll.outer) || 0;
    initialized = true;
    if (focusTab) $(`view-${activeView}-tab`).focus({preventScroll:true});
  }
  $('start-writing').addEventListener('click', () => { showView('input'); $('prompt-title').focus({preventScroll:true}); });
  $('review-guide').addEventListener('click', () => { showView('guide'); $('guide-title').focus({preventScroll:true}); });
  $('prompt-form').addEventListener('submit', event => {
    event.preventDefault();
    const draft = currentDraft();
    draft.invalid.clear();
    fieldControls.forEach(({ input, error, optional }, index) => {
      draft.values[index] = input.value;
      const missing = !optional && !input.value.trim();
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
    draft.result = builder.build(draft.template, draft.values);
    draft.hasGenerated = true;
    draft.message = steps[active].prompts[activePrompt].kind === 'decision'
      ? '내 결정문을 완성했습니다. 진행 중인 AI 채팅에 붙여 넣어 결과 요약을 갱신하세요.'
      : steps[active].prompts[activePrompt].includesCommon
        ? '프롬프트를 완성했습니다. 복사해 진행 중인 AI 채팅에 이어서 붙여 넣으세요.'
        : '프롬프트를 완성했습니다. 확인하고 복사하세요.';
    draft.messageError = false;
    updateResult();
    $('prompt-text').scrollTop = 0;
    $('output-title').focus();
  });
  function openStep(index, updateUrl = false, initialProcess = null) {
    rememberScroll();
    initialized = false;
    active = index;
    activeInputPrompt = 0;
    activePrompt = 0;
    const step = steps[index];
    if (initialProcess) {
      const processIndex = step.prompts.findIndex(prompt => prompt.kind === initialProcess);
      if (processIndex >= 0) activeInputPrompt = activePrompt = processIndex;
    }
    $('dialog-kicker').textContent = index === 0 ? '공통 원칙 · 보고서 작성 1~9단계에 포함' : step.isAppendix ? 'APPENDIX · 선택 부록' : `STEP ${step.number} / ${totalSteps}`;
    $('dialog-title').textContent = step.title;
    $('dialog-description').textContent = step.subtitle;
    $('dialog-decision').textContent = step.decision;
    $('dialog-image').src = imagePath(index);
    $('prev-step').disabled = index === 0;
    $('next-step').disabled = index === steps.length - 1;
    $('step-count').textContent = index === 0 ? `START / ${totalSteps}` : step.isAppendix ? '선택 부록' : `${step.number} / ${totalSteps}`;
    $('view-tabs').replaceChildren();
    const isWorkflow = step.prompts[0].kind === 'document-workflow';
    const isSetup = step.prompts[0].kind === 'skill-setup';
    $('lesson-materials').hidden = !step.prompts.some(prompt => prompt.sourceText);
    const views = isSetup ? [['setup', '스킬 추가 안내'], ['input', '확인 프롬프트']]
      : [['guide', '작성 요령'], ['input', isWorkflow ? '프롬프트' : '입력·프롬프트']];
    if (step.prompts.some(prompt => prompt.sourceText)) views.push(['source', 'PDF 원문']);
    if (step.prompts.some(prompt => prompt.kind === 'decision')) views.push(['decision', '내 결정 기록']);
    if (instructor && !isSetup) {
      views.push(['example', isWorkflow ? '진행 예시' : '응답 예시']);
      if (step.prompts.some(prompt => prompt.kind === 'decision')) views.push(['decision-example', '선택 후 예시']);
    }

    if (index > 0) views.forEach(([view, title], i) => {
      const tab = create('button', '', title);
      tab.id = `view-${view}-tab`; tab.type = 'button';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', view === 'source' ? 'source-panel' : view === 'setup' ? 'setup-panel' : view === 'guide' ? 'guide-panel' : ['example', 'decision-example'].includes(view) ? 'example-panel' : 'prompt-panel');
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
    $('prompt-tabs').setAttribute('aria-label', `${step.title.replace(/ 채팅$/, '')} 과정`);
    const processes = step.prompts.filter(prompt => prompt.kind !== 'decision');
    if (processes.length > 1) processes.forEach((prompt, i) => {
      const tab = create('button', '', prompt.title);
      tab.type = 'button';tab.id = `tab-${step.id}-${i}`;
      tab.setAttribute('aria-controls', instructor ? 'guide-panel prompt-panel example-panel source-panel' : 'guide-panel prompt-panel source-panel');
      tab.addEventListener('click', () => { activeInputPrompt = i; showView(activeView); });
      $('prompt-tabs').append(tab);
    });
    if (!modal.open) modal.showModal();
    showView(index === 0 ? 'input' : isSetup ? 'setup' : instructor ? (['report-body', 'report-final'].includes(initialProcess) ? 'example' : 'input') : 'guide');
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
  $('copy-source').addEventListener('click', async () => {
    if (activeView !== 'source') return;
    const text = $('source-text').textContent;
    const revision = viewRevision;
    $('copy-source').disabled = true;
    let success = false;
    if (window.isSecureContext && navigator.clipboard) {
      try { await navigator.clipboard.writeText(text); success = true; } catch (_) { /* Use selection fallback. */ }
    }
    if (revision !== viewRevision || !modal.open) return;
    $('copy-source').disabled = false;
    if (!success) success = fallbackCopy(text, 'copy-source');
    $('source-status').textContent = success ? '강의안 원문 프롬프트를 복사했습니다. 입력할 부분과 첨부 자료를 확인해 사용하세요.' : '자동 복사가 제한되어 내용을 선택했습니다. Ctrl+C 또는 ⌘C로 복사하세요.';
    if (!success) {
      const range = document.createRange(); range.selectNodeContents($('source-text'));
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    }
  });
  $('copy-example').addEventListener('click', async () => {
    if (!instructor || !['example', 'decision-example'].includes(activeView)) return;
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
      $('copy-status').textContent = steps[active].prompts[activePrompt].kind === 'skill-setup'
        ? '복사했습니다. 스킬을 저장하고 켠 Claude 대화에 붙여 넣어 사용 가능 여부를 확인하세요.'
        : steps[active].prompts[activePrompt].kind === 'document-workflow'
        ? '복사했습니다. 최신 보고서 초안과 빈 HWPX 양식을 준비한 Claude 대화에 붙여 넣으세요.'
        : steps[active].prompts[activePrompt].kind === 'decision'
        ? '복사했습니다. 진행 중인 AI 채팅에 붙여 넣어 결과 요약을 갱신하세요.'
        : '복사했습니다. 진행 중인 AI 채팅에 이어서 붙여 넣으세요.';
      copyTimer = setTimeout(() => {$('copy-prompt').innerHTML = '<span aria-hidden="true">▣</span> 프롬프트 복사';$('copy-prompt').classList.remove('copied');}, 2500);
    } else {
      const range = document.createRange();range.selectNodeContents($('prompt-text'));
      const selection = window.getSelection();selection.removeAllRanges();selection.addRange(range);
      $('copy-status').textContent = '자동 복사가 제한되어 내용을 선택했습니다. Ctrl+C 또는 ⌘C로 복사하세요. 모바일에서는 길게 눌러 복사하세요.';
    }
  });
  [
    ['copy-skill-name', 'skill-name', '스킬 이름을 복사했습니다.'],
    ['copy-skill-description', 'skill-description', '스킬 설명을 복사했습니다.'],
    ['copy-skill-instructions', 'skill-instructions', '마크다운 본문 전체를 복사했습니다. Claude의 스킬 지침에 붙여 넣으세요.'],
    ['copy-skill-check', 'setup-check-text', '확인 문구를 복사했습니다. 스킬을 저장하고 켠 Claude 대화에서 사용하세요.']
  ].forEach(([buttonId, textId, message]) => $(buttonId).addEventListener('click', async () => {
    if (activeView !== 'setup') return;
    const revision = viewRevision;
    const text = $(textId).textContent;
    $(buttonId).disabled = true;
    let success = false;
    if (window.isSecureContext && navigator.clipboard) {
      try { await navigator.clipboard.writeText(text); success = true; } catch (_) { /* Local copy fallback below. */ }
    }
    if (revision !== viewRevision || !modal.open || activeView !== 'setup') return;
    $(buttonId).disabled = false;
    if (!success) success = fallbackCopy(text, buttonId);
    $('setup-status').textContent = success ? message : '자동 복사가 제한되어 내용을 선택했습니다. Ctrl+C 또는 ⌘C로 복사하세요.';
    if (!success) {
      if (textId === 'skill-instructions') $('skill-instructions').parentElement.open = true;
      const range = document.createRange(); range.selectNodeContents($(textId));
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    }
  }));
  function handleHash() {
    const index = steps.findIndex(step => `#${step.id}` === location.hash);
    if (index >= 0) {
      const process = new URLSearchParams(location.search).get('process');
      const initialProcess = steps[index].id === 'step-9' ? ({body: 'report-body', final: 'report-final'}[process] || null) : null;
      openStep(index, false, initialProcess);
    }
    else if (modal.open) modal.close();
  }
  window.addEventListener('popstate', handleHash);
  window.addEventListener('hashchange', handleHash);
  handleHash();
})();
