// Toolbar, keyboard shortcuts, zoom, fullscreen, drag & drop, auto-hiding chrome.
(() => {
  const { config, state, el } = Follow;
  let idleTimer = null;

  function wake() {
    el.bar.classList.remove('hide');
    document.body.style.cursor = '';
    clearTimeout(idleTimer);
    if (state.playing) {
      idleTimer = setTimeout(() => {
        if (state.playing) {
          el.bar.classList.add('hide');
          document.body.style.cursor = 'none';
        }
      }, config.hideAfterMs);
    }
  }

  function setZoom(z) {
    state.zoom = Math.max(config.minZoom, Math.min(config.maxZoom, Math.round(z * 100) / 100));
    el.zoomVal.textContent = Math.round(state.zoom * 100) + '%';
    Follow.viewer.build(false);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  }

  function bind() {
    const s = Follow.scroller;

    // open
    const pick = () => el.file.click();
    document.getElementById('open').onclick = pick;
    document.getElementById('open2').onclick = pick;
    el.file.onchange = () => { Follow.viewer.load(el.file.files[0]); el.file.value = ''; };

    // controls
    el.play.onclick = () => s.setPlaying(!state.playing);
    el.speed.oninput = () => s.setSpeed(+el.speed.value);
    document.getElementById('zin').onclick = () => setZoom(state.zoom + config.zoomStep);
    document.getElementById('zout').onclick = () => setZoom(state.zoom - config.zoomStep);
    document.getElementById('top').onclick = s.toTop;
    document.getElementById('fs').onclick = toggleFullscreen;
    el.viewer.addEventListener('scroll', s.updateProgress, { passive: true });

    // keep the toolbar visible while the user interacts
    ['mousemove', 'touchstart', 'pointerdown'].forEach((ev) =>
      window.addEventListener(ev, wake, { passive: true }));

    // keyboard
    window.addEventListener('keydown', (e) => {
      if (!state.doc) return;
      if (e.target.tagName === 'INPUT' && e.target.type !== 'range') return;
      switch (e.key) {
        case ' ': e.preventDefault(); s.setPlaying(!state.playing); break;
        case 'ArrowUp': e.preventDefault(); s.setSpeed(state.speed + config.speedStep); break;
        case 'ArrowDown': e.preventDefault(); s.setSpeed(state.speed - config.speedStep); break;
        case '+': case '=': setZoom(state.zoom + config.zoomStep); break;
        case '-': setZoom(state.zoom - config.zoomStep); break;
        case 'f': case 'F': toggleFullscreen(); break;
        case 'Home': s.toTop(); break;
        default: return;
      }
      wake();
    });

    // rebuild on width change (debounced)
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (state.doc && el.viewer.clientWidth !== state.lastW) Follow.viewer.build(false);
      }, 250);
    });

    // drag & drop
    ['dragenter', 'dragover'].forEach((ev) =>
      window.addEventListener(ev, (e) => { e.preventDefault(); el.empty.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach((ev) =>
      window.addEventListener(ev, (e) => { e.preventDefault(); el.empty.classList.remove('drag'); }));
    window.addEventListener('drop', (e) => Follow.viewer.load(e.dataTransfer.files[0]));
  }

  Follow.ui = { bind, wake, setZoom };
})();
