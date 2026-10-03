// ===== DISABLE PINCH-ZOOM ON TOUCH DEVICES =====
// iOS Safari ignores user-scalable=no, so block its gesture events too.
(function () {
  ["gesturestart", "gesturechange", "gestureend"].forEach(function (type) {
    document.addEventListener(
      type,
      function (e) {
        e.preventDefault();
      },
      { passive: false },
    );
  });

  // two-finger touch = pinch, stop it (single-finger scrolling still works)
  document.addEventListener(
    "touchmove",
    function (e) {
      if (e.touches.length > 1) e.preventDefault();
    },
    { passive: false },
  );
})();