const BACKEND_URL = '';

async function api(path, opts={}){
  const res = await fetch(BACKEND_URL + path, Object.assign({
    headers: {'Content-Type':'application/json'},
    credentials: 'include'
  }, opts));
  return res.json();
}

function formatPlanLabel(plan) {
  if (plan === 'premium-week') return 'Premium 7 Day';
  if (plan === 'premium-month') return 'Premium 30 Day';
  if (plan === 'premium-custom') return 'Premium Custom';
  return 'Free';
}

const loginArea = document.getElementById('login-area');
const panel = document.getElementById('panel');
const loginError = document.getElementById('login-error');
const detectBtn = document.getElementById('detect-discord');
const detectResult = document.getElementById('detect-result');
let discordOnlyAdmin = false;

async function loadAdminConfig(){
  const cfg = await api('/admin/config');
  if (cfg && cfg.discordOnlyAdmin) {
    discordOnlyAdmin = true;
    document.getElementById('admin-username').style.display = 'none';
    document.getElementById('admin-password').style.display = 'none';
    document.getElementById('btn-login').style.display = 'none';
    detectResult.textContent = 'Discord-only admin mode aktif. Silakan login via Discord lalu klik Detect.';
  }
}

document.getElementById('btn-login').addEventListener('click', async ()=>{
  loginError.style.display='none';
  if (discordOnlyAdmin) {
    loginError.textContent = 'Discord-only admin mode aktif. Login via Discord terlebih dahulu.';
    loginError.style.display='block';
    return;
  }
  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value;
  if (!username || !password){ loginError.textContent='Masukkan kredensial'; loginError.style.display='block'; return; }
  const r = await api('/admin/login', {method:'POST', body: JSON.stringify({username,password})});
  if (r.success){ showPanel(); loadUsers(); } else { loginError.textContent = r.error || 'Login failed'; loginError.style.display='block'; }
});

if (detectBtn) {
  detectBtn.addEventListener('click', async () => {
    detectResult.textContent = 'Mendeteksi...';
    let r = await api('/admin/detect');
    if (!r.success) r = await api('/auth/user');
    if (r && r.user) {
      detectResult.textContent = `Detected: ${r.user.username || r.user.id}#${r.user.discriminator || ''} (id: ${r.user.id})`;
      if (r.admin) {
        showPanel();
        loadUsers();
      } else if (r.success && !r.admin) {
        detectResult.textContent += ' — akun ini bukan admin.';
      }
    } else {
      detectResult.textContent = 'Tidak terdeteksi. Silakan login via Discord di halaman utama (/auth/discord) lalu coba lagi.';
    }
  });
}

document.getElementById('btn-logout').addEventListener('click', async ()=>{
  await api('/admin/logout', {method:'POST'});
  panel.style.display='none'; loginArea.style.display='block';
});

async function showPanel(){ loginArea.style.display='none'; panel.style.display='block'; }

function fmtDate(ms){ if(!ms) return '-'; const d=new Date(ms); return d.toLocaleString(); }

async function loadUsers(){
  const r = await api('/admin/users');
  if (!r.success){ alert('Gagal memuat pengguna: '+(r.error||'unknown')); return; }
  const tbody = document.getElementById('users-tbody'); tbody.innerHTML='';
  for(const u of r.users){
    const tr = document.createElement('tr');
    
    // Avatar column
    const avatarTd = document.createElement('td');
    const avatarImg = document.createElement('img');
    if (u.avatar && u.id) {
      avatarImg.src = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=40`;
      avatarImg.onerror = () => { avatarImg.src = 'https://via.placeholder.com/40'; };
    } else {
      avatarImg.src = 'https://via.placeholder.com/40';
    }
    avatarImg.style.width = '40px';
    avatarImg.style.height = '40px';
    avatarImg.style.borderRadius = '50%';
    avatarImg.title = u.id;
    avatarTd.appendChild(avatarImg);
    
    // Username column
    const usernameTd = document.createElement('td'); 
    const displayName = u.username ? `${u.username}${u.discriminator ? '#' + u.discriminator : ''}` : `Unknown (${u.id})`;
    usernameTd.textContent = displayName;
    
    // ID column
    const idTd = document.createElement('td'); idTd.textContent = u.id;
    const orderTd = document.createElement('td'); orderTd.textContent = u.loginOrder ? `#${u.loginOrder}` : '-';
    const planTd = document.createElement('td');
    const sel = document.createElement('select');
    ['free','premium-week','premium-month','premium-custom'].forEach(p=>{ const o=document.createElement('option'); o.value=p; o.textContent = formatPlanLabel(p); if(p===u.plan) o.selected=true; sel.appendChild(o); });
    planTd.appendChild(sel);
    const expiryTd = document.createElement('td');
    expiryTd.textContent = u.planExpiresAt ? new Date(u.planExpiresAt).toLocaleString() : '-';
    const statusTd = document.createElement('td');
    statusTd.textContent = u.status === 'active' ? 'Premium Active' : (u.status === 'expired' ? 'Expired (Free)' : 'Free');
    const convTd = document.createElement('td'); convTd.textContent = u.conversionsThisMonth || 0;
    const lastTd = document.createElement('td'); lastTd.textContent = fmtDate(u.lastConversionAt);
    const actTd = document.createElement('td');
    const btn = document.createElement('button'); btn.textContent='Set Plan';
    btn.addEventListener('click', async ()=>{
      const chosen = sel.value;
      let customDays = null;
      if (chosen === 'premium-custom') {
        const input = prompt('Masukkan durasi plan premium (dalam hari):', '3');
        if (input === null) return; // cancel
        customDays = parseInt(input);
        if (isNaN(customDays) || customDays <= 0) {
          alert('Durasi hari tidak valid!');
          return;
        }
      }
      const res = await api('/admin/set-plan', {method:'POST', body: JSON.stringify({userId: u.id, plan: chosen, customDays})});
      if (res.success){ alert('Plan diubah'); loadUsers(); } else { alert('Gagal: '+(res.error||'unknown')); }
    });
    actTd.appendChild(btn);

    tr.appendChild(avatarTd); tr.appendChild(usernameTd); tr.appendChild(idTd); tr.appendChild(orderTd); tr.appendChild(planTd); tr.appendChild(expiryTd); tr.appendChild(statusTd); tr.appendChild(convTd); tr.appendChild(lastTd); tr.appendChild(actTd);
    tbody.appendChild(tr);
  }
}

// Check if already logged in
(async ()=>{
  await loadAdminConfig();
  const me = await api('/admin/me');
  if (me && me.isAdmin){ showPanel(); loadUsers(); }
})();
