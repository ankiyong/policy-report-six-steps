/* 항목 입력값을 기존 프롬프트의 빈칸에 안전하게 삽입합니다. */
(function (global) {
  'use strict';

  function getFields(template) {
    const fields = [];
    const linePattern = /[^\r\n]+/g;
    const inputLine = /^[\t ]*-[\t ]+([^:\r\n]+?):[\t ]*(\[[^\[\]\r\n]*\])[\t ]*$/;
    const inputSections = new Set(['내가 입력할 내용', '내 결정']);
    let inInputSection = false;
    let match;

    while ((match = linePattern.exec(template)) !== null) {
      const line = match[0];
      const section = line.match(/^[\t ]*\[([^\[\]]+)\][\t ]*$/);
      if (section) {
        inInputSection = inputSections.has(section[1].trim());
        continue;
      }

      // 공통 지침·요청 사항·본문의 대괄호는 사용자 입력으로 취급하지 않습니다.
      if (!inInputSection) continue;
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
        isAttachment: token === '[첨부]',
        placeholder: hint || '내용을 입력하거나 자료를 붙여 넣으세요.'
      });
    }

    return fields;
  }

  function build(template, valuesArray) {
    const fields = getFields(template);
    const values = Array.isArray(valuesArray) ? valuesArray : [];
    let result = '';
    let cursor = 0;

    fields.forEach((field, index) => {
      const value = values[index] == null ? '' : String(values[index]);
      result += template.slice(cursor, field.start) + (value.trim() ? value : field.token);
      cursor = field.end;
    });

    return result + template.slice(cursor);
  }

  global.PromptBuilder = Object.freeze({ getFields, build });
})(window);
