const initFn = function () {
  try {
    const platform = navigator?.userAgentData?.platform || navigator?.platform || null
    const iOS = !!platform && /iPad|iPhone|iPod/.test(platform);
    
    if (iOS) {
      window.location.href = 'itms-apps://itunes.apple.com/app/apple-store/id1512435212?mt=8';
    } else {
      window.location.href = 'https://apps.apple.com/app/apple-store/id1512435212';
    }
  } catch (e) {
    console.log(e)
  }
}
initFn()
