/* Route presenter keys to exactly one lecture, including after using its controls. */
(() => {
  'use strict';
  const players = [];
  let active = null;
  const editable = 'input,select,textarea,[contenteditable]:not([contenteditable="false"]),[role="textbox"]';
  const interactive = 'button,a,summary,[role="button"]';
  const directions = {PageUp: -1, PageDown: 1, ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1, ArrowDown: 1};

  function select(entry) {
    active = entry;
    players.forEach(item => item.player.setAttribute('data-pointer-active', String(item === entry)));
  }

  function ownerOf(target) {
    return players.find(entry => entry.region.contains(target));
  }

  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target;
    if (target.closest?.(editable)) return;
    const inRegion = ownerOf(target);
    const fullscreen = players.find(entry => document.fullscreenElement === entry.player)
      || players.find(entry => entry.player.classList.contains('is-expanded'));
    // Leave links and controls elsewhere on the page to their native keyboard behavior.
    const onPage = target === document.body || target === document.documentElement;
    if (!fullscreen && !inRegion && !onPage) return;
    const entry = fullscreen || inRegion || active;
    if (!entry) return;
    let action;
    if (Object.prototype.hasOwnProperty.call(directions, event.key)) action = directions[event.key];
    else if (event.key === 'Home') action = 'first';
    else if (event.key === 'End') action = 'last';
    else if (event.key === ' ' || event.key === 'Enter') {
      // A focused button/link must still activate once, without also advancing here.
      if (target.closest?.(interactive) || (!onPage && !entry.stage.contains(target))) return;
      action = 1;
    } else return;
    event.preventDefault();
    select(entry);
    entry.navigate(action);
  });

  window.LectureNavigation = Object.freeze({
    register({player, stage, navigate}) {
      const region = player.closest('.lecture-section') || player;
      const entry = {player, stage, region, navigate};
      players.push(entry);
      region.addEventListener('pointerdown', () => select(entry));
      region.addEventListener('focusin', () => select(entry));
      if (!active) select(entry);
    }
  });
})();
