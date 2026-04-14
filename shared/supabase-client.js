(function () {
  function getConfig() {
    const config = window.APP_CONFIG || {};
    return {
      url: config.SUPABASE_URL || "",
      anonKey: config.SUPABASE_ANON_KEY || ""
    };
  }

  function hasConfig() {
    const config = getConfig();
    return Boolean(config.url && config.anonKey && window.supabase);
  }

  function createClient(options) {
    if (!hasConfig()) {
      return null;
    }

    const config = getConfig();
    return window.supabase.createClient(config.url, config.anonKey, options || {});
  }

  window.AppSupabase = {
    getConfig,
    hasConfig,
    createClient
  };
})();
