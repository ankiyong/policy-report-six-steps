/* 항목 입력값을 기존 프롬프트의 빈칸에 안전하게 삽입합니다. */
(function (global) {
  'use strict';

  const inputLine = /^[\t ]*-[\t ]+([^:\r\n]+?):[\t ]*(\[[^\[\]\r\n]*\])[\t ]*$/;
  const inputSections = new Set(['내가 입력할 내용', '내가 조사한 자료와 분석', '조사 후 내 생각', '내 결정']);

  function getFields(template) {
    const fields = [];
    const linePattern = /[^\r\n]+/g;
    let currentSection = '';
    let recordIndex = 0;
    let match;

    while ((match = linePattern.exec(template)) !== null) {
      const line = match[0];
      const section = line.match(/^[\t ]*\[([^\[\]]+)\][\t ]*$/);
      if (section) {
        currentSection = section[1].trim();
        recordIndex = 0;
        continue;
      }

      // 공통 지침·요청 사항·본문의 대괄호는 사용자 입력으로 취급하지 않습니다.
      if (!inputSections.has(currentSection)) continue;
      const recordHeading = line.match(/^[\t ]*자료[\t ]+([1-9]\d*)[\t ]*$/);
      if (recordHeading) {
        recordIndex = Number(recordHeading[1]) - 1;
        continue;
      }
      const input = line.match(inputLine);
      if (!input) continue;

      const label = input[1].trim();
      const token = input[2];
      const hint = token.slice(1, -1).trim();
      const start = match.index + line.lastIndexOf(token);
      fields.push({
        id: `field-${fields.length}`,
        label,
        token,
        start,
        end: start + token.length,
        section: currentSection,
        recordIndex,
        isAttachment: token === '[첨부]',
        placeholder: hint || '내용을 입력하거나 자료를 붙여 넣으세요.'
      });
    }

    return fields;
  }

  function expandRepeatSection(template, count, sectionName) {
    if (!Number.isSafeInteger(count) || count < 1) {
      throw new RangeError('자료 개수는 1 이상의 정수여야 합니다.');
    }
    // 자료가 하나일 때는 번호나 줄바꿈을 추가하지 않아 원문과 정확히 같습니다.
    if (count === 1) return template;
    const fields = getFields(template).filter(field => field.section === sectionName);
    if (!fields.length) throw new Error('반복할 입력 영역을 찾을 수 없습니다.');

    const first = fields[0];
    const last = fields[fields.length - 1];
    const start = Math.max(template.lastIndexOf('\n', first.start - 1), template.lastIndexOf('\r', first.start - 1)) + 1;
    const tail = template.slice(last.end).match(/^[^\r\n]*/)[0];
    const end = last.end + tail.length;
    const block = template.slice(start, end);
    const newline = (block.match(/\r\n|\n|\r/) || template.match(/\r\n|\n|\r/) || ['\n'])[0];
    const records = Array.from({ length: count }, (_, index) => `자료 ${index + 1}${newline}${block}`);
    return template.slice(0, start) + records.join(`${newline}${newline}`) + template.slice(end);
  }

  function build(template, valuesArray) {
    const fields = getFields(template);
    const values = Array.isArray(valuesArray) ? valuesArray : [];
    let result = '';
    let cursor = 0;

    fields.forEach((field, index) => {
      const value = values[index] == null ? '' : String(values[index]);
      result += template.slice(cursor, field.start) + (value.trim() ? value : '');
      cursor = field.end;
    });

    return result + template.slice(cursor);
  }

  global.PromptBuilder = Object.freeze({ getFields, expandRepeatSection, build });
})(window);
