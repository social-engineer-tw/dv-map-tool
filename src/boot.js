(function () {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async function boot() {
    const fallback = window.siteData || {};

    try {
      if (window.loadPublicSiteData) {
        window.siteData = await window.loadPublicSiteData(fallback);
      }
    } catch (error) {
      window.siteData = fallback;
    }

    await loadScript("./src/app.js");
  }

  boot();
})();
