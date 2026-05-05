import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

const navStyle = {
    background: '#1a1a1a',
    borderBottom: '1px solid #c9a84c33',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
};

const logoStyle = {
    color: '#c9a84c',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    letterSpacing: '0.05em',
    textDecoration: 'none',
};

const linkStyle = (active) => ({
    color: active ? '#c9a84c' : '#ffffff88',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: active ? '600' : '400',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    background: active ? '#c9a84c15' : 'transparent',
    borderBottom: active ? '2px solid #c9a84c' : '2px solid transparent',
    transition: 'all 0.2s',
});

const links = [
    { label: 'Dashboard',    href: '/dashboard' },
    { label: 'Budget',       href: '/budget' },
    { label: 'Transactions', href: '/transactions' },
    { label: 'Chatbot',      href: '/chatbot' },
];

export default function AuthenticatedLayout({ children }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div style={{ background: '#0f0f0f', minHeight: '100vh' }}>

            {/* Navbar */}
            <nav style={navStyle}>

                {/* Logo */}
                <Link href="/dashboard" style={logoStyle}>
                    💰 BudgetAI
                </Link>

                {/* Liens desktop */}
                <div style={{ display: 'flex', gap: '0.25rem' }} className="nav-desktop">
                    {links.map(l => (
                        <Link key={l.href} href={l.href} style={linkStyle(url.startsWith(l.href))}>
                            {l.label}
                        </Link>
                    ))}
                </div>

                {/* Infos utilisateur + déconnexion */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#ffffff44', fontSize: '0.85rem' }}>
                        {user?.name}
                    </span>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        style={{ background: 'none', border: '1px solid #c9a84c44', color: '#c9a84c', borderRadius: '6px', padding: '0.3rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                        Déconnexion
                    </Link>

                    {/* Burger menu mobile */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="nav-burger"
                        style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: '1.4rem', cursor: 'pointer', display: 'none' }}
                    >
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </nav>

            {/* Menu mobile déroulant */}
            {menuOpen && (
                <div style={{ background: '#1a1a1a', borderBottom: '1px solid #c9a84c22', padding: '0.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} className="nav-mobile">
                    {links.map(l => (
                        <Link
                            key={l.href}
                            href={l.href}
                            style={{ ...linkStyle(url.startsWith(l.href)), display: 'block' }}
                            onClick={() => setMenuOpen(false)}
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>
            )}

            {/* Contenu de la page */}
            <main>{children}</main>
        </div>
    );
}