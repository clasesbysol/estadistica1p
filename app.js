async function boot(){
  const mount=document.getElementById('mount');
  try{
    const topicFiles=Array.from({length:17},(_,i)=>`topics/topic-${String(i+1).padStart(2,'0')}.html`);
    const files=['content-a.html',...topicFiles,'topics/inventory.html'];
    const chunks=await Promise.all(files.map(f=>fetch('./'+f).then(r=>{if(!r.ok)throw new Error(f);return r.text()})));
    mount.innerHTML=chunks.join('\n');
  }catch(e){
    mount.innerHTML='<section class="hero"><h1>No se pudo cargar la guía</h1><p>Recargá la página.</p></section>';
    console.error(e); return;
  }

  const sidebar=document.getElementById('sidebar');
  const menuBtn=document.getElementById('menuBtn');
  menuBtn.addEventListener('click',()=>sidebar.classList.toggle('open'));
  document.querySelectorAll('#sidebar a').forEach(a=>a.addEventListener('click',()=>sidebar.classList.remove('open')));

  const typeNav=document.getElementById('typeNav');
  document.querySelectorAll('section.topic').forEach(sec=>{
    const n=sec.querySelector('.type-num')?.textContent?.trim()||'•';
    const title=sec.querySelector('h2')?.textContent?.trim()||'Tipo';
    const a=document.createElement('a');
    a.href='#'+sec.id;
    a.innerHTML=`<span>${n}</span>${title}`;
    a.addEventListener('click',()=>sidebar.classList.remove('open'));
    typeNav.appendChild(a);
  });

  const search=document.getElementById('search');
  search.addEventListener('input',()=>{
    const q=search.value.toLowerCase().trim();
    document.querySelectorAll('.topic').forEach(s=>s.classList.toggle('hidden',q && !s.innerText.toLowerCase().includes(q)));
  });

  document.getElementById('topBtn').addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

  let deferredPrompt=null;
  const installBtn=document.getElementById('installBtn');
  const installStatus=document.getElementById('installStatus');
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;

  function installedUI(){
    installStatus.textContent='App instalada';
    installBtn.textContent='✓ Instalada';
    installBtn.disabled=true;
    installBtn.classList.add('ready');
  }
  if(standalone()) installedUI();

  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault(); deferredPrompt=e;
    installBtn.classList.add('ready'); installStatus.textContent='Lista para instalar';
  });
  installBtn.addEventListener('click',async()=>{
    if(standalone()) return installedUI();
    if(deferredPrompt){
      deferredPrompt.prompt();
      const choice=await deferredPrompt.userChoice.catch(()=>null);
      deferredPrompt=null;
      if(choice?.outcome==='accepted') installedUI();
    }else{
      installStatus.textContent='Menú ⋮ → Instalar app';
      alert('Si el navegador todavía no muestra el instalador, abrí el menú ⋮ y elegí “Instalar app” o “Agregar a pantalla principal”.');
    }
  });
  window.addEventListener('appinstalled',installedUI);

  if(window.MathJax?.typesetPromise){
    try{await MathJax.typesetPromise();}catch(e){console.warn(e)}
  }
}

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));
}
boot();
