// Shared namespace: config, state, storage helpers, DOM refs.
// Classic scripts (no modules) so index.html also works when opened from disk.
(() => {
  const Follow = (window.Follow = {});

  Follow.config = {
    minSpeed: 5,
    maxSpeed: 400,
    speedStep: 5,
    defaultSpeed: 60,
    minZoom: 0.5,
    maxZoom: 3,
    zoomStep: 0.1,
    maxPageWidth: 1400,
    hideAfterMs: 2500,
    prerenderMargin: '1600px 0px',
    pdfWorker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  };

  Follow.state = {
    doc: null,
    zoom: 1,
    playing: false,
    speed: Follow.config.defaultSpeed,
    pos: 0,      // fractional scroll position we drive
    lastSet: 0,  // last integer scrollTop we observed after writing
    lastT: 0,
    gen: 0,      // bumps on every rebuild so stale renders get dropped
    lastW: 0,
  };

  Follow.storage = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem('follow.' + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('follow.' + key, JSON.stringify(value)); } catch (e) {}
    },
  };

  const $ = (id) => document.getElementById(id);
  Follow.el = {
    viewer: $('viewer'),
    pages: $('pages'),
    bar: $('bar'),
    empty: $('empty'),
    play: $('play'),
    speed: $('speed'),
    speedVal: $('sv'),
    zoomVal: $('zv'),
    prog: $('prog'),
    name: $('name'),
    file: $('file'),
  };
})();
