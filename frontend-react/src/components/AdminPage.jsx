import React, { useState, useEffect } from 'react';
import { useI18n } from '../context/LanguageContext';
import { ShieldAlert, LogOut, RefreshCw, Key, UserCheck } from 'lucide-react';

const BACKEND_URL = window.location.port === '5173'
  ? `${window.location.protocol}//${window.location.hostname}:3000`
  : '';

export const AdminPage = ({ currentUser }) => {
  const { t, lang } = useI18n();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [discordOnlyAdmin, setDiscordOnlyAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [detectResult, setDetectResult] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const apiCall = async (path, opts = {}) => {
    const res = await fetch(BACKEND_URL + path, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...opts.headers,
      },
      credentials: 'include',
    });
    return res.json();
  };

  useEffect(() => {
    const initAdmin = async () => {
      try {
        const config = await apiCall('/admin/config');
        if (config && config.discordOnlyAdmin) {
          setDiscordOnlyAdmin(true);
          setDetectResult(lang === 'id' ? 'MODE KHUSUS ADMIN: Silakan login melalui Discord.' : 'ADMIN ONLY MODE: Please log in via Discord.');
        }

        const me = await apiCall('/admin/me');
        if (me && me.isAdmin) {
          setIsAdminLoggedIn(true);
          loadUsers();
        }
      } catch (err) {
        console.error('Admin init failed:', err);
      }
    };
    initAdmin();
  }, [lang]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (discordOnlyAdmin) {
      setLoginError(lang === 'id' ? 'Harus login melalui Discord terlebih dahulu.' : 'Must log in via Discord first.');
      return;
    }
    if (!username.trim() || !password) {
      setLoginError(lang === 'id' ? 'Username dan password wajib diisi.' : 'Username and password are required.');
      return;
    }

    try {
      const res = await apiCall('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (res.success) {
        setIsAdminLoggedIn(true);
        loadUsers();
      } else {
        setLoginError(res.error || (lang === 'id' ? 'Autentikasi gagal.' : 'Authentication failed.'));
      }
    } catch (err) {
      setLoginError(lang === 'id' ? 'Gagal terhubung ke server.' : 'Server connection error.');
    }
  };

  const handleDetectDiscord = async () => {
    setDetectResult(lang === 'id' ? 'Mendeteksi sesi...' : 'Detecting session...');
    try {
      let r = await apiCall('/admin/detect');
      if (!r.success) r = await apiCall('/auth/user');
      if (r && r.user) {
        setDetectResult(lang === 'id' ? `Terdeteksi: ${r.user.username} (ID: ${r.user.id})` : `Detected: ${r.user.username} (ID: ${r.user.id})`);
        if (r.admin) {
          setIsAdminLoggedIn(true);
          loadUsers();
        } else {
          setDetectResult((prev) => prev + (lang === 'id' ? ' — Akun Anda bukan admin.' : ' — Account is not in the admin list.'));
        }
      } else {
        setDetectResult(lang === 'id' ? 'Sesi tidak terdeteksi. Silakan login ke Discord terlebih dahulu.' : 'Session not detected. Please log in via Discord first.');
      }
    } catch (err) {
      setDetectResult(lang === 'id' ? 'Gagal memverifikasi sesi.' : 'Session query failed.');
    }
  };

  const handleLogout = async () => {
    try {
      await apiCall('/admin/logout', { method: 'POST' });
      setIsAdminLoggedIn(false);
      setUsers([]);
    } catch (err) {
      console.error('Admin logout failed:', err);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await apiCall('/admin/users');
      if (res.success) {
        setUsers(res.users);
      } else {
        alert((lang === 'id' ? 'Gagal memuat daftar pengguna: ' : 'Failed to retrieve users: ') + (res.error || 'unknown'));
      }
    } catch (err) {
      alert(lang === 'id' ? 'Koneksi timeout.' : 'Connection timeout.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPlan = async (userId, chosenPlan) => {
    let customDays = null;
    if (chosenPlan === 'premium-custom') {
      const input = prompt(lang === 'id' ? 'Masukkan durasi premium (dalam hari):' : 'Enter premium duration (in days):', '3');
      if (input === null) return;
      customDays = parseInt(input);
      if (isNaN(customDays) || customDays <= 0) {
        alert(lang === 'id' ? 'Jumlah hari tidak valid!' : 'Invalid day count!');
        return;
      }
    }

    try {
      const res = await apiCall('/admin/set-plan', {
        method: 'POST',
        body: JSON.stringify({ userId, plan: chosenPlan, customDays }),
      });
      if (res.success) {
        alert(lang === 'id' ? 'Paket berhasil disimpan!' : 'Plan updated successfully!');
        loadUsers();
      } else {
        alert((lang === 'id' ? 'Gagal menyimpan paket: ' : 'Update failed: ') + (res.error || 'unknown'));
      }
    } catch (err) {
      alert(lang === 'id' ? 'Koneksi timeout saat menyimpan paket.' : 'Timeout error updating plan.');
    }
  };

  const formatPlanStatus = (status) => {
    if (status === 'active') return lang === 'id' ? 'AKTIF' : 'ACTIVE';
    if (status === 'expired') return lang === 'id' ? 'KADALUARSA' : 'EXPIRED';
    return lang === 'id' ? 'GRATIS' : 'FREE';
  };

  return (
    <div className="admin-page-container">
      <div className="admin-card glass-panel">
        <div className="admin-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="admin-title-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={20} className="admin-shield-icon" style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>{t('admin.users_title')}</h2>
          </div>
          {isAdminLoggedIn && (
            <button onClick={handleLogout} className="btn-admin-logout" style={{ cursor: 'pointer' }}>
              <LogOut size={12} style={{ marginRight: '6px' }} />
              <span>{t('admin.logout_button')}</span>
            </button>
          )}
        </div>

        {!isAdminLoggedIn ? (
          <div className="admin-login-area">
            <p className="admin-help-text" style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '20px' }}>
              {lang === 'id' ? 'Masuk dengan kredensial admin atau deteksi sesi Discord terdaftar.' : 'Log in using admin credentials or detect active Discord session.'}
            </p>
            
            <div className="admin-login-controls" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button onClick={handleDetectDiscord} className="btn-detect" style={{ alignSelf: 'flex-start' }}>
                <UserCheck size={14} style={{ marginRight: '6px' }} />
                <span>{t('admin.detect_discord')}</span>
              </button>

              {!discordOnlyAdmin && (
                <form onSubmit={handleLogin} className="admin-credentials-form" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="admin-input"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="admin-input"
                  />
                  <button type="submit" className="btn-login-submit">
                    <Key size={14} style={{ marginRight: '6px' }} />
                    <span>{t('admin.login_button')}</span>
                  </button>
                </form>
              )}
            </div>

            {detectResult && <p className="detect-result-msg" style={{ marginTop: '16px', fontSize: '13px', color: 'var(--primary)' }}>{detectResult}</p>}
            {loginError && <p className="login-error-msg" style={{ marginTop: '16px', fontSize: '13px', color: 'var(--danger)' }}>Error: {loginError}</p>}
          </div>
        ) : (
          <div className="admin-panel-area">
            <div className="admin-actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <p className="admin-help-text" style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                {t('admin.plan_help')}
              </p>
              <button onClick={loadUsers} className="btn-refresh-users" disabled={isLoading} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={12} className={isLoading ? 'spin' : ''} />
                <span>{lang === 'id' ? 'Segarkan Data' : 'Refresh Data'}</span>
              </button>
            </div>

            <div className="users-table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Username</th>
                    <th>{t('admin.table.user_id')}</th>
                    <th>No</th>
                    <th>{t('admin.table.plan')}</th>
                    <th>{t('admin.table.expiry')}</th>
                    <th>{t('admin.table.status')}</th>
                    <th>{lang === 'id' ? 'Konversi (Bulan Ini)' : 'Conversions (Month)'}</th>
                    <th>{t('admin.table.last_conversion')}</th>
                    <th>{t('admin.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr key={u.id}>
                      <td>
                        <img
                          src={
                            u.avatar
                              ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=40`
                              : 'https://i.ibb.co/4ZffCQHF/file-0000000037307207800c1b0df4ef447d.png'
                          }
                          alt="Avatar"
                          className="table-avatar"
                          onError={(e) => {
                            e.target.src = 'https://i.ibb.co/4ZffCQHF/file-0000000037307207800c1b0df4ef447d.png';
                          }}
                          style={{ width: '28px', height: '28px', display: 'block' }}
                        />
                      </td>
                      <td className="table-username" style={{ fontWeight: '600' }}>
                        {u.username ? `${u.username}${u.discriminator ? '#' + u.discriminator : ''}` : `ID_${u.id}`}
                      </td>
                      <td className="table-id">{u.id}</td>
                      <td>{u.loginOrder ? `#${u.loginOrder}` : idx + 1}</td>
                      <td>
                        <select
                          defaultValue={u.plan || 'free'}
                          onChange={(e) => {
                            u.tempPlan = e.target.value;
                          }}
                          className="table-select"
                        >
                          <option value="free">{lang === 'id' ? 'Gratis' : 'Free'}</option>
                          <option value="premium-week">7 Hari</option>
                          <option value="premium-month">30 Hari</option>
                          <option value="premium-custom">{lang === 'id' ? 'Kustom' : 'Custom'}</option>
                        </select>
                      </td>
                      <td className="table-date">
                        {u.planExpiresAt ? new Date(u.planExpiresAt).toLocaleString() : '-'}
                      </td>
                      <td>
                        <span className={`status-badge ${u.status === 'active' ? 'active' : 'free'}`}>
                          {formatPlanStatus(u.status)}
                        </span>
                      </td>
                      <td>{u.conversionsThisMonth || 0}</td>
                      <td className="table-date">
                        {u.lastConversionAt ? new Date(u.lastConversionAt).toLocaleString() : '-'}
                      </td>
                      <td>
                        <button
                          onClick={() => handleSetPlan(u.id, u.tempPlan || u.plan || 'free')}
                          className="btn-set-plan"
                        >
                          {lang === 'id' ? 'Simpan' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
