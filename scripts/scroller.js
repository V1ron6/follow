// Auto-scroll engine: requestAnimationFrame loop with a fractional accumulator,
// so very slow speeds (a few px/s) still move smoothly.
(() => {
  const { config, state, el } = Follow;

  function tick(t) {
    if (!state.playing) return;
    const dt = Math.min((t - state.lastT) / 1000, 0.1); // clamp after tab sleep
    state.lastT = t;

    // If scrollTop drifted from what we last set, the user scrolled manually: adopt it.
    if (Math.abs(el.viewer.scrollTop - state.lastSet) > 2) state.pos = el.viewer.scrollTop;

    const max = Follow.viewer.maxScroll();
    state.pos = Math.min(max, state.pos + state.speed * dt);
    el.viewer.scrollTop = state.pos;
    state.lastSet = el.viewer.scrollTop;
    updateProgress();

    if (state.pos >= max - 1) { setPlaying(false); return; }
    requestAnimationFrame(tick);
  }

  function setPlaying(on) {
    if (on && !state.doc) return;
    if (on && state.pos >= Follow.viewer.maxScroll() - 1) {
      el.viewer.scrollTop = 0;
      state.pos = state.lastSet = 0;
    }
    state.playing = on;
    el.play.textContent = on ? 'Pause' : 'Play';
    el.play.classList.toggle('on', on);
    if (on) {
      state.pos = el.viewer.scrollTop;
      state.lastT = performance.now();
      requestAnimationFrame(tick);
    }
    if (Follow.ui) Follow.ui.wake();
  }

  function setSpeed(v) {
    state.speed = Math.max(config.minSpeed, Math.min(config.maxSpeed, v));
    el.speed.value = state.speed;
    el.speedVal.textContent = state.speed + ' px/s';
    Follow.storage.set('speed', state.speed);
  }

  function updateProgress() {
    const m = Follow.viewer.maxScroll();
    el.prog.style.width = (m ? (el.viewer.scrollTop / m) * 100 : 0) + '%';
  }

  function toTop() {
    el.viewer.scrollTop = 0;
    state.pos = state.lastSet = 0;
    updateProgress();
  }

  Follow.scroller = { setPlaying, setSpeed, updateProgress, toTop };
})();
