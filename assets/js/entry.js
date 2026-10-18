/* 기존 단계 바로가기 주소를 계속 지원합니다. */
(() => {
  if (/^#(?:common|step-[1-6])$/.test(location.hash)) {
    location.replace('practice.html' + location.search + location.hash);
  }
})();
