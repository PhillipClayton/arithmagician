/* Toast styles injected at runtime (lightweight) */
(function injectToastStyles(){
  const css = `
  #toast-container {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .toast {
    min-width: 200px;
    max-width: 360px;
    background: rgba(0,0,0,0.85);
    color: #fff;
    padding: 10px 14px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    font-family: 'Roboto', sans-serif;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 200ms ease, transform 200ms ease;
  }
  .toast.show { opacity: 1; transform: translateY(0); }
  .toast.success { background: rgba(46, 204, 113, 0.95); color: #022; }
  .toast.error { background: rgba(231, 76, 60, 0.95); color: #fff; }
  `;
  const style = document.createElement('style');
  style.setAttribute('data-generated','true');
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
})();

/* Toast helper */
function showToast(message, type = 'info', duration = 2500) {
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast ' + (type === 'success' ? 'success' : (type === 'error' ? 'error' : ''));
  toast.textContent = message;
  container.appendChild(toast);
  // force layout then show
  void toast.offsetWidth;
  toast.classList.add('show');
  const hideId = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { try { toast.remove(); } catch(e){} }, 220);
  }, duration);
  return hideId;
}

// Replace alerts in app with showToast

(function replaceAlertsInApp(){
  // We'll update script.js to call showToast where appropriate. This file just ensures helper exists.
})();
