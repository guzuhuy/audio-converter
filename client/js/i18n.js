// Simple client-side i18n loader
(function(){
  function fetchJson(url){
    return fetch(url).then(r=>{ if(!r.ok) throw new Error('Failed to load '+url); return r.json(); });
  }

  const defaultLang = localStorage.getItem('lang') || 'en';
  let current = defaultLang;
  let translations = {};

  function applyTranslations(){
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = get(key);
      if(val != null) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = get(key);
      if(val != null) el.innerHTML = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = get(key);
      if(val != null) el.placeholder = val;
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const val = get(key);
      if(val != null) el.title = val;
    });
    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      const key = el.getAttribute('data-i18n-value');
      const val = get(key);
      if(val != null) el.value = val;
    });
    // update discord button text id
    const discordBtn = document.getElementById('discord-btn-text');
    if(discordBtn) {
      const v = get('discord.login');
      if(v) discordBtn.textContent = v;
    }
    // update nav links if present
    ['nav.features','nav.pricing','nav.security'].forEach(k => {
      const sel = '[data-i18n="'+k+'"]';
      const el = document.querySelector(sel);
      if(el){ const v = get(k); if(v) el.textContent = v; }
    });
    // update lang button active classes
    const btnId = document.getElementById('btn-id');
    const btnEn = document.getElementById('btn-en');
    if(btnId) btnId.classList.toggle('active', current === 'id');
    if(btnEn) btnEn.classList.toggle('active', current === 'en');
    document.documentElement.lang = current;
  }

  function get(key){
    const parts = key.split('.');
    let o = translations;
    for(const p of parts){ if(!o) return null; o = o[p]; }
    return o;
  }

  window.setLang = function(lang){
    if(!lang) return;
    localStorage.setItem('lang', lang);
    load(lang).catch(err => console.error('i18n load error', err));
  };

  function load(lang){
    return fetchJson('/i18n/'+lang+'.json').then(json => {
      translations = json;
      current = lang;
      if(lang === 'en') window.__i18n_en = json;
      applyTranslations();
    });
  }

  window.initI18n = function(){
    load(current).catch(err => { console.error(err); });
  };

  // helper: get translation for a key in dot notation, with optional fallback to English
  window.t = function(key){
    const v = get(key);
    if(v != null) return v;
    // fallback: if current isn't 'en', try loading english catalog synchronously from cache or fetch
    if(current !== 'en'){
      // try cached english in window.__i18n_en
      if(window.__i18n_en){
        const parts = key.split('.');
        let o = window.__i18n_en;
        for(const p of parts){ if(!o) return null; o = o[p]; }
        if(o != null) return o;
      }
      // fetch english catalog and cache it (async but we return null now)
      fetch('/i18n/en.json').then(r=>r.ok? r.json():null).then(j=>{ if(j) window.__i18n_en = j; }).catch(()=>{});
    }
    return null;
  };

  // auto-init when script loaded
  document.addEventListener('DOMContentLoaded', () => { initI18n(); });
  
  // Inject a small floating language switcher if none exists on the page
  document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('i18n-floating')) return;
    if(document.getElementById('btn-id') || document.getElementById('btn-en') || document.getElementById('lang-id') || document.getElementById('lang-en')) return;
    try{
      const wrap = document.createElement('div');
      wrap.id = 'i18n-floating';
      wrap.style.position = 'fixed';
      wrap.style.top = '12px';
      wrap.style.right = '12px';
      wrap.style.zIndex = '99999';
      wrap.style.display = 'flex';
      wrap.style.gap = '6px';
      wrap.style.background = 'rgba(5,8,15,0.6)';
      wrap.style.backdropFilter = 'blur(8px)';
      wrap.style.border = '1px solid rgba(255,255,255,0.04)';
      wrap.style.padding = '6px';
      wrap.style.borderRadius = '999px';

      const btnId = document.createElement('button');
      btnId.id = 'btn-id';
      btnId.textContent = 'ID';
      btnId.style.padding = '6px 10px';
      btnId.style.border = 'none';
      btnId.style.background = 'transparent';
      btnId.style.color = '#e8e4f0';
      btnId.style.cursor = 'pointer';
      btnId.style.fontSize = '12px';
      btnId.addEventListener('click', () => { window.setLang('id'); });

      const btnEn = document.createElement('button');
      btnEn.id = 'btn-en';
      btnEn.textContent = 'EN';
      btnEn.style.padding = '6px 10px';
      btnEn.style.border = 'none';
      btnEn.style.background = 'transparent';
      btnEn.style.color = '#e8e4f0';
      btnEn.style.cursor = 'pointer';
      btnEn.style.fontSize = '12px';
      btnEn.addEventListener('click', () => { window.setLang('en'); });

      wrap.appendChild(btnId);
      wrap.appendChild(btnEn);
      document.body.appendChild(wrap);
      // apply active state after initial load
      setTimeout(applyTranslations, 200);
    }catch(e){ /* noop */ }
  });
})();
