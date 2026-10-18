/* 정적 사이트의 강사용 입장 확인입니다. 서버 인증이나 비공개 자료 보호 기능은 아닙니다. */
(() => {
  'use strict';

  const SESSION_KEY = 'policy-report-instructor-session';
  const SESSION_VERSION = '2026-10-instructor-v1';
  const PASSWORD_SALT = 'd496ef133e0907fc60462cf32f11b8d15a00f9e28538fb01';
  const PASSWORD_HASH = '68521ec04f443669694b54aac79a137bca8a959bcdcf6b9b2a90dfc0f15059cb';
  const ITERATIONS = 210000;
  let forcedLocked = false;

  function isUnlocked() {
    if (forcedLocked) return false;
    try {
      return window.sessionStorage.getItem(SESSION_KEY) === SESSION_VERSION;
    } catch (_) {
      return false;
    }
  }

  // 입력된 URL을 그대로 이동에 사용하지 않고, 허용된 같은 폴더의 경로만 재구성합니다.
  function sanitizeReturnTarget(value) {
    const fallback = 'instructor.html';
    if (typeof value !== 'string' || value.length > 256 || /[\s\\\u0000-\u001f\u007f]/.test(value)) return fallback;
    if (value === 'instructor.html') return value;
    if (!value.startsWith('practice.html?')) return fallback;
    const match = /^practice\.html\?([^#]+)(#[^#]*)?$/.exec(value);
    if (!match) return fallback;
    const params = new URLSearchParams(match[1]);
    const keys = Array.from(params.keys());
    if (params.getAll('mode').length !== 1 || params.get('mode') !== 'instructor') return fallback;
    if (keys.some(key => key !== 'mode' && key !== 'process')) return fallback;
    if (params.getAll('process').length > 1 || (params.has('process') && params.get('process') !== 'body')) return fallback;
    const hash = match[2] || '';
    if (hash && !/^#(?:common|step-[1-7])$/.test(hash)) return fallback;
    return 'practice.html?mode=instructor' + (params.has('process') ? '&process=body' : '') + hash;
  }

  function protectedLocation() {
    const filename = window.location.pathname.split('/').pop();
    return filename === 'instructor.html' || (filename === 'practice.html' && new URLSearchParams(window.location.search).get('mode') === 'instructor');
  }

  function requireAccess() {
    if (isUnlocked()) {
      document.documentElement.classList.remove('instructor-locked');
      return true;
    }
    document.documentElement.classList.add('instructor-locked');
    const filename = window.location.pathname.split('/').pop();
    const target = sanitizeReturnTarget(filename + window.location.search + window.location.hash);
    window.location.replace('instructor-login.html?next=' + encodeURIComponent(target));
    return false;
  }

  function fromHex(hex) {
    return Uint8Array.from(hex.match(/../g), pair => parseInt(pair, 16));
  }

  async function authenticate(password) {
    if (!window.crypto || !window.crypto.subtle || typeof TextEncoder === 'undefined') {
      throw new Error('이 브라우저에서는 비밀번호를 확인할 수 없습니다. HTTPS 주소를 최신 브라우저에서 열어 주세요.');
    }
    if (typeof password !== 'string' || !password) return false;
    const key = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const actual = new Uint8Array(await window.crypto.subtle.deriveBits({name: 'PBKDF2', salt: fromHex(PASSWORD_SALT), iterations: ITERATIONS, hash: 'SHA-256'}, key, 256));
    const expected = fromHex(PASSWORD_HASH);
    let mismatch = actual.length ^ expected.length;
    for (let index = 0; index < expected.length; index += 1) mismatch |= actual[index] ^ expected[index];
    if (mismatch !== 0) return false;
    try {
      window.sessionStorage.setItem(SESSION_KEY, SESSION_VERSION);
      if (window.sessionStorage.getItem(SESSION_KEY) !== SESSION_VERSION) throw new Error('session unavailable');
    } catch (_) {
      throw new Error('브라우저의 세션 저장이 차단되어 입장할 수 없습니다. 이 사이트의 저장 허용 설정을 확인해 주세요.');
    }
    forcedLocked = false;
    return true;
  }

  function logout() {
    forcedLocked = true;
    document.documentElement.classList.add('instructor-locked');
    try { window.sessionStorage.removeItem(SESSION_KEY); } catch (_) { /* 접근 확인은 잠긴 상태로 유지합니다. */ }
    window.location.replace('index.html');
  }

  window.InstructorAccess = Object.freeze({isUnlocked, require: requireAccess, logout, authenticate, sanitizeReturnTarget});
  if (protectedLocation()) requireAccess();
  window.addEventListener('pageshow', () => {
    if (protectedLocation()) requireAccess();
  });
})();
