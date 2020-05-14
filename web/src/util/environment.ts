export const isDevelopment = window.location.hostname.search('localhost') === 0 ||
  window.location.hostname.search('127.0.0.1') === 0 ||
  window.location.hostname.search('nginx') === 0 ||
  window.location.hostname.search('ngrok') === 0;

export const isProduction = !isDevelopment;

export const isIOS = Boolean(navigator.platform) && /iPad|iPhone|iPod/.test(navigator.platform);
