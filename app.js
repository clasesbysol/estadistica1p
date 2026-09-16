async function boot() {
  const mount = document.getElementById('mount');
  try {
    const [a, b1, b2] = await Promise.all([
      fetch('./content-a.html').then(r => {
        if (!r.ok) throw new Error('No se pudo cargar content-a.html');
        return r.text();
      }),
      fetch('./content-b1.html').then(r => {
        if (!r.ok) throw new Error('No se pudo cargar content-b1.html');
        return r.text();
      }),
      fetch('./content-b2.html').then(r => {
        if (!r.ok) throw new Error('No se pudo cargar content-b2.html');
        return r.text();
      })
    ]);
    mount.outerHTML = a + b1 + b2;
  } catch (err) {
    mount.innerHTML = '<div class="loading">No se pudo cargar la guía. Recargá la página.</div>';
    console.error(err);
    return;
  }

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js', {scope: './'});
      await navigator.serviceWorker.ready;
      console.log('Service Worker listo:', reg.scope);
    } catch (err) {
      console.warn('No se pudo registrar el Service Worker', err);
    }
  }

  let deferredInstallPrompt = null;
  const installBtn = document.getElementById('installBtn');
  const installFab = document.getElementById('installFab');
  const installStatus = document.getElementById('installStatus');
  const installOverlay = document.getElementById('installOverlay');
  const closeInstallHelp = document.getElementById('closeInstallHelp');

  function isStandalone(){
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }
  function markInstalled(){
    installBtn.textContent = '✓ App instalada';
    installBtn.classList.add('installed');
    installBtn.disabled = true;
    installFab.classList.remove('show');
    installStatus.textContent = 'Abierta en modo app';
  }
  function setInstallReady(){
    if (isStandalone()) return markInstalled();
    installBtn.textContent = '⬇ Instalar app';
    installBtn.disabled = false;
    installFab.classList.add('show');
    installStatus.textContent = 'Tocá “Instalar app”';
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    setInstallReady();
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    markInstalled();
  });

  async function installApp(){
    if (isStandalone()) return markInstalled();
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      try { await deferredInstallPrompt.userChoice; } catch (_) {}
      deferredInstallPrompt = null;
      return;
    }
    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const help = document.getElementById('installHelp');
    if (isiOS) {
      help.innerHTML = 'En iPhone/iPad: tocá <b>Compartir</b> y después <b>Agregar a pantalla de inicio</b>.';
    } else {
      help.innerHTML = 'El instalador todavía no fue habilitado por el navegador. Esperá unos segundos y probá de nuevo. También podés abrir el menú del navegador y elegir <b>Instalar app</b> o <b>Agregar a pantalla principal</b>.';
    }
    installOverlay.classList.add('open');
  }

  installBtn.addEventListener('click', installApp);
  installFab.addEventListener('click', installApp);
  closeInstallHelp.addEventListener('click', () => installOverlay.classList.remove('open'));
  installOverlay.addEventListener('click', (e) => { if (e.target === installOverlay) installOverlay.classList.remove('open'); });

  if (isStandalone()) markInstalled();
  else {
    installFab.classList.add('show');
    installStatus.textContent = 'Preparando instalación…';
  }

  setTimeout(() => {
    if (!deferredInstallPrompt && !isStandalone()) installStatus.textContent = 'Lista para instalar desde el navegador';
  }, 2500);

  const search = document.getElementById('search');
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    document.querySelectorAll('section.topic').forEach(sec => {
      if (!q) { sec.classList.remove('hidden-by-search'); return; }
      sec.classList.toggle('hidden-by-search', !sec.innerText.toLowerCase().includes(q));
    });
  });

  if (window.MathJax && MathJax.typesetPromise) {
    try { await MathJax.typesetPromise(); } catch (e) { console.warn(e); }
  }
}

boot();
