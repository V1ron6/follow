// PDF loading and page rendering (PDF.js). Pages render lazily as they near the viewport.
(() => {
  const { config, state, el } = Follow;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let io = null;

  function maxScroll() {
    return Math.max(0, el.viewer.scrollHeight - el.viewer.clientHeight);
  }

  async function load(file) {
    if (!file || (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name))) return;
    Follow.scroller.setPlaying(false);
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      if (state.doc) state.doc.destroy();
      state.doc = await pdfjsLib.getDocument({ data }).promise;
    } catch (e) {
      alert('Could not open that PDF.');
      return;
    }
    el.name.textContent = file.name;
    el.name.title = file.name;
    el.empty.classList.add('hidden');
    el.bar.classList.remove('hidden');
    el.viewer.scrollTop = 0;
    state.pos = state.lastSet = 0;
    await build(true);
    Follow.ui.wake();
  }

  async function build(reset) {
    if (!state.doc) return;
    const my = ++state.gen;
    const ratio = !reset && maxScroll() ? el.viewer.scrollTop / maxScroll() : 0;
    if (io) io.disconnect();
    el.pages.innerHTML = '';
    state.lastW = el.viewer.clientWidth;
    const avail = Math.min(el.viewer.clientWidth - 24, config.maxPageWidth) * state.zoom;

    io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { io.unobserve(e.target); renderPage(e.target, my); }
    }), { root: el.viewer, rootMargin: config.prerenderMargin });

    const pages = await Promise.all(
      Array.from({ length: state.doc.numPages }, (_, i) => state.doc.getPage(i + 1))
    );
    if (my !== state.gen) return;

    pages.forEach((p, i) => {
      const scale = avail / p.getViewport({ scale: 1 }).width;
      const v = p.getViewport({ scale });
      const d = document.createElement('div');
      d.className = 'pg';
      d.style.width = v.width + 'px';
      d.style.height = v.height + 'px';
      d.dataset.n = i + 1;
      d.dataset.scale = scale;
      el.pages.appendChild(d);
      io.observe(d);
    });

    if (!reset) el.viewer.scrollTop = ratio * maxScroll();
    state.pos = state.lastSet = el.viewer.scrollTop;
    Follow.scroller.updateProgress();
  }

  async function renderPage(node, my) {
    const p = await state.doc.getPage(+node.dataset.n);
    if (my !== state.gen) return;
    const v = p.getViewport({ scale: +node.dataset.scale * dpr });
    const c = document.createElement('canvas');
    c.width = v.width;
    c.height = v.height;
    c.style.width = '100%';
    c.style.height = '100%';
    await p.render({ canvasContext: c.getContext('2d'), viewport: v }).promise;
    if (my === state.gen) node.appendChild(c);
  }

  Follow.viewer = { load, build, maxScroll };
})();
