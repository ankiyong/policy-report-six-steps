(() => {
  'use strict';
  const access = window.InstructorAccess;
  const form = document.getElementById('instructor-login-form');
  const password = document.getElementById('instructor-password');
  const submit = document.getElementById('instructor-login-submit');
  const toggle = document.getElementById('password-toggle');
  const error = document.getElementById('login-error');
  const next = access.sanitizeReturnTarget(new URLSearchParams(window.location.search).get('next'));
  let busy = false;

  if (access.isUnlocked()) {
    window.location.replace(next);
    return;
  }

  toggle.addEventListener('click', () => {
    const reveal = password.type === 'password';
    password.type = reveal ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(reveal));
    toggle.textContent = reveal ? '숨기기' : '보기';
    password.focus();
  });

  password.addEventListener('input', () => {
    error.textContent = '';
    password.removeAttribute('aria-invalid');
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    busy = true;
    submit.disabled = true;
    toggle.disabled = true;
    password.readOnly = true;
    submit.textContent = '확인 중…';
    form.setAttribute('aria-busy', 'true');
    error.textContent = '';
    try {
      const unlocked = await access.authenticate(password.value);
      if (unlocked) {
        password.value = '';
        window.location.replace(next);
        return;
      }
      error.textContent = '비밀번호가 일치하지 않습니다. 다시 입력해 주세요.';
      password.setAttribute('aria-invalid', 'true');
    } catch (failure) {
      error.textContent = failure instanceof Error ? failure.message : '비밀번호 확인 중 문제가 발생했습니다. 다시 시도해 주세요.';
    } finally {
      busy = false;
      submit.disabled = false;
      toggle.disabled = false;
      password.readOnly = false;
      submit.textContent = '강사용 페이지 입장';
      form.setAttribute('aria-busy', 'false');
      password.value = '';
      password.type = 'password';
      toggle.setAttribute('aria-pressed', 'false');
      toggle.textContent = '보기';
      password.focus();
    }
  });
})();
