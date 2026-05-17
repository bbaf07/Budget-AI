import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { t, languages, currencies } from '@/lib/i18n';

const C = {
    bg: '#0a0e1a',
    card: '#141929',
    border: '#1e2a4a',
    gold: '#d4af37',
    text: '#e8eef7',
    textDim: '#8b9bb8',
    blue: '#3b82f6',
};

const navStyle = {
    background: 'linear-gradient(180deg, #141929 0%, #0a0e1a 100%)',
    borderBottom: `1px solid ${C.gold}33`,
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
};

const logoStyle = {
    color: C.gold,
    fontWeight: 'bold',
    fontSize: '1.15rem',
    letterSpacing: '0.08em',
    textDecoration: 'none',
    textShadow: `0 0 12px ${C.gold}44`,
};

const linkStyle = (active) => ({
    color: active ? C.gold : C.textDim,
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: active ? '600' : '500',
    padding: '0.5rem 0.9rem',
    borderRadius: '8px',
    background: active ? `${C.gold}15` : 'transparent',
    borderBottom: active ? `2px solid ${C.gold}` : '2px solid transparent',
    transition: 'all 0.2s',
});

const iconBtn = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    position: 'relative',
    padding: '0.4rem 0.7rem',
    borderRadius: '6px',
    color: C.gold,
    fontWeight: '600',
};

const dropdown = {
    position: 'absolute',
    top: '110%',
    right: 0,
    background: C.card,
    border: `1px solid ${C.gold}44`,
    borderRadius: '10px',
    minWidth: '260px',
    maxHeight: '460px',
    overflowY: 'auto',
    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
    zIndex: 200,
};

function getXsrfToken() {
    return decodeURIComponent(
        document.cookie.split('; ').find(r => r.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
    );
}

export default function AuthenticatedLayout({ children }) {
    const { url, props } = usePage();
    const user   = props.auth?.user;
    const locale = user?.locale || 'fr';
    const curr   = user?.currency || 'EUR';

    const [menuOpen, setMenuOpen]   = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [prefsOpen, setPrefsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const unreadCount = notifications.filter(n => !n.read).length;

    async function loadNotifications() {
        try {
            const res = await fetch('/notifications', { credentials: 'same-origin' });
            const data = await res.json();
            setNotifications(data.notifications || []);
        } catch (e) { console.error(e); }
    }

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [url]);

    async function markAllRead() {
        await fetch('/notifications/read-all', {
            method: 'POST',
            headers: { 'X-XSRF-TOKEN': getXsrfToken(), 'Accept': 'application/json' },
            credentials: 'same-origin',
        });
        loadNotifications();
    }

    async function updatePreference(field, value) {
        await fetch('/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': getXsrfToken(),
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body: JSON.stringify({ [field]: value }),
        });
        // Recharge complète pour récupérer les nouvelles props auth
        window.location.reload();
    }

    const isAdmin = user?.role === 'admin';

const links = [
    { key: 'dashboard',    href: '/dashboard'    },
    { key: 'budget',       href: '/budget'       },
    { key: 'goals',        href: '/goals'        },
    { key: 'transactions', href: '/transactions' },
    { key: 'send',         href: '/money'        },
    { key: 'chatbot',      href: '/chatbot'      },
    ...(isAdmin ? [{ key: 'admin', href: '/admin/dashboard', label: '👑 Admin' }] : []),
];

    const langActive = languages.find(l => l.code === locale) || languages[0];
    const currActive = currencies.find(c => c.code === curr) || currencies[0];

    return (
        <div style={{ background: C.bg, minHeight: '100vh' }} dir={locale === 'ar' ? 'rtl' : 'ltr'}>

            <nav style={navStyle} translate="no">
                <Link href="/dashboard" translate="no" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
    <img src="/images/logo.png" alt="My Wise Money" style={{ height: '42px', filter: `drop-shadow(0 0 12px ${C.gold}44)` }} />
</Link>

                <div style={{ display: 'flex', gap: '0.25rem' }} className="nav-desktop">
                    {links.map(l => (
    <Link key={l.href} href={l.href} style={linkStyle(url.startsWith(l.href))}>
        {l.label || t(locale, l.key)}
    </Link>
))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                    <div style={{ position: 'relative' }} translate="no">
                        <button onClick={() => { setPrefsOpen(!prefsOpen); setNotifOpen(false); }} style={iconBtn} translate="no">
                            <span translate="no">{langActive.code.toUpperCase()}</span>
                            <span style={{ margin: '0 0.3rem', color: C.textDim }}>·</span>
                            <span translate="no">{currActive.symbol} {currActive.code}</span>
                        </button>
                        {prefsOpen && (
                            <div style={dropdown} translate="no">
                                <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.gold}33` }}>
                                    <p style={{ color: C.gold, fontWeight: '600', fontSize: '0.9rem' }} translate="no">Settings</p>
                                </div>

                                <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.border}` }}>
                                    <p style={{ color: C.textDim, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }} translate="no">Language</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                                        {languages.map(l => (
                                            <button key={l.code} onClick={() => updatePreference('locale', l.code)} translate="no"
                                                style={{
                                                    background: locale === l.code ? `${C.gold}33` : 'transparent',
                                                    border: `1px solid ${locale === l.code ? C.gold : C.border}`,
                                                    color: locale === l.code ? C.gold : C.textDim,
                                                    borderRadius: '6px', padding: '0.35rem 0.5rem',
                                                    fontSize: '0.75rem', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                    textAlign: 'left',
                                                }}>
                                                <span>{l.flag}</span>
                                                <span style={{ fontWeight: '600' }}>{l.code.toUpperCase()}</span>
                                                <span style={{ color: locale === l.code ? C.gold : C.textDim }}>{l.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ padding: '0.75rem 1rem' }}>
                                    <p style={{ color: C.textDim, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }} translate="no">Currency</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.3rem' }}>
                                        {currencies.map(c => (
                                            <button key={c.code} onClick={() => updatePreference('currency', c.code)} translate="no"
                                                style={{
                                                    background: curr === c.code ? `${C.gold}33` : 'transparent',
                                                    border: `1px solid ${curr === c.code ? C.gold : C.border}`,
                                                    color: curr === c.code ? C.gold : C.textDim,
                                                    borderRadius: '6px', padding: '0.35rem 0.4rem',
                                                    fontSize: '0.75rem', cursor: 'pointer',
                                                    fontWeight: '600',
                                                }}>
                                                {c.symbol} {c.code}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => { setNotifOpen(!notifOpen); setPrefsOpen(false); if (!notifOpen) markAllRead(); }}
                            style={{ ...iconBtn, fontSize: '1.1rem' }}
                        >
                            🔔
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: 0, right: 0,
                                    background: '#f87171', color: '#fff',
                                    borderRadius: '50%', fontSize: '0.65rem',
                                    minWidth: '16px', height: '16px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', boxShadow: '0 0 8px #f8717188',
                                }}>{unreadCount}</span>
                            )}
                        </button>
                        {notifOpen && (
                            <div style={dropdown}>
                                <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.gold}33` }}>
                                    <p style={{ color: C.gold, fontWeight: '600', fontSize: '0.9rem' }}>Notifications</p>
                                </div>
                                {notifications.length === 0 ? (
                                    <p style={{ color: C.textDim, textAlign: 'center', padding: '2rem 1rem', fontSize: '0.85rem' }}>—</p>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} style={{
                                            padding: '0.75rem 1rem',
                                            borderBottom: `1px solid ${C.border}`,
                                            background: n.read ? 'transparent' : `${C.gold}11`,
                                        }}>
                                            <p style={{ color: C.gold, fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>{n.title}</p>
                                            <p style={{ color: C.textDim, fontSize: '0.8rem' }}>{n.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <Link href="/profile" translate="no" style={{ color: C.textDim, fontSize: '0.85rem', textDecoration: 'none', borderBottom: `1px dashed ${C.textDim}66`, paddingBottom: '2px' }}>
    {user?.name}
</Link>
                    <Link
                        href="/logout" method="post" as="button"
                        style={{ background: 'none', border: `1px solid ${C.gold}66`, color: C.gold, borderRadius: '6px', padding: '0.35rem 0.85rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' }}
                    >
                        {t(locale, 'logout')}
                    </Link>

                    <button onClick={() => setMenuOpen(!menuOpen)} className="nav-burger"
                        style={{ background: 'none', border: 'none', color: C.gold, fontSize: '1.4rem', cursor: 'pointer', display: 'none' }}>
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </nav>

            {menuOpen && (
                <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '0.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} className="nav-mobile">
                    {links.map(l => (
    <Link key={l.href} href={l.href} style={linkStyle(url.startsWith(l.href))}>
        {l.label || t(locale, l.key)}
    </Link>
))}
                </div>
            )}

            <main>{children}</main>
        </div>
    );
}