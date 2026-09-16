// This function is copied into the page's MAIN world by Chrome. Keep it self-contained.
export async function openObjectives(retry = false) {
  if (location.protocol !== 'https:' || !['ea.com', 'www.ea.com'].includes(location.hostname) ||
      !/^\/ea-sports-fc\/ultimate-team\/web-app(?:\/|$)/.test(location.pathname)) {
    return { code: 'wrong-page', message: 'Select the EA FC Web App tab first.' };
  }
  const svc = globalThis.services;
  const config = svc?.Configuration;
  const router = svc?.URL;
  if (typeof config?.checkFeatureEnabled !== 'function' ||
      typeof config?.setFeatureEnabled !== 'function' ||
      typeof router?.checkAuth !== 'function' ||
      typeof router?.isValidDeepLinkID !== 'function' ||
      typeof router?.process !== 'function' ||
      typeof svc?.Objectives?.requestCategories !== 'function') {
    return { code: 'unsupported', message: 'The app is still loading, or EA has changed its interface. Log in and try again.' };
  }
  if (!router.checkAuth()) {
    return { code: 'login', message: 'Log in to your Ultimate Team club first.' };
  }
  if (!router.isValidDeepLinkID('scmp')) {
    return { code: 'unsupported', message: 'This app version does not expose the expected Objectives route.' };
  }
  const key = 'enableSeasonalCampaigns';
  const before = config.checkFeatureEnabled(key);
  if (!before && !retry) {
    return { code: 'disabled', message: 'The local Objectives switch is off. You can try enabling it for this page session. EA may still reject the request.' };
  }
  let changed = false;
  try {
    if (!before) {
      config.setFeatureEnabled(key, true);
      changed = true;
    }
    // Load actual UT categories first, then select one explicitly. The bare scmp
    // route defaults to Season and can switch to Meta even when FCAS is disabled.
    const response = await new Promise(resolve => {
      const observer = {};
      let observable, done = false;
      const finish = value => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { observable?.unobserve?.(observer); } catch { /* Preserve app behavior. */ }
        resolve(value);
      };
      const timer = setTimeout(() => finish(null), 8000);
      try {
        observable = svc.Objectives.requestCategories();
        if (typeof observable?.observe !== 'function') { finish(null); return; }
        observable.observe(observer, (_sender, result) => finish(result));
      } catch { finish(null); }
    });
    if (!response?.success) {
      if (changed) config.setFeatureEnabled(key, before);
      return { code: 'categories-failed', message: 'Objectives categories did not load. Refresh the Web App and try again. If it continues, EA may not currently be providing the data.' };
    }
    const categories = Array.isArray(response.response?.categories) ? response.response.categories : [];
    const category = categories.filter(item => Number.isSafeInteger(item?.id) && item.id >= 0)
      .slice().sort((a, b) => (Number(a.priority) || 0) - (Number(b.priority) || 0))[0];
    if (!category) {
      if (changed) config.setFeatureEnabled(key, before);
      return { code: 'no-categories', message: 'The app returned no usable Ultimate Team categories. A successful status alone does not mean objectives are available.' };
    }
    // EA's own route retains its authentication and server-response handling.
    // Do not modify enableMetaSeason: it is tied to a separate FCAS session.
    if (!router.process('easfc://fut/scmp/' + category.id)) {
      if (changed) config.setFeatureEnabled(key, before);
      return { code: 'rejected', message: 'The app could not open its Objectives route. Refresh the page and log in again.' };
    }
    await new Promise(resolve => setTimeout(resolve, 1800));
    const visible = [...document.querySelectorAll('.ut-objective-category')]
      .some(element => element.getClientRects().length > 0);
    if (!visible && changed) config.setFeatureEnabled(key, before);
    return visible
      ? { code: 'opened', message: 'An Ultimate Team objective category is open. Check the page for its groups and tasks. EA may still show a Season error because that separate service is unavailable.' }
      : { code: 'unconfirmed', message: 'Opening was requested, but the Objectives screen is not visible yet. Check the page for an EA error or loading indicator. Any local switch change was reverted.' };
  } catch {
    if (changed) config.setFeatureEnabled(key, before);
    return { code: 'error', message: 'The app could not complete the attempt. Refresh the Web App to reset it. This version may no longer be compatible.' };
  }
}
