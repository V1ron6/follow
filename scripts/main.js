// Entry point.
(() => {
  const { config, el } = Follow;

  pdfjsLib.GlobalWorkerOptions.workerSrc = config.pdfWorker;

  Follow.scroller.setSpeed(Follow.storage.get('speed', config.defaultSpeed));
  Follow.ui.bind();
})();
