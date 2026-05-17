import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

const C = {
    bg: '#0a0e1a', card: '#141929', border: '#1e2a4a',
    gold: '#d4af37', text: '#e8eef7', textDim: '#8b9bb8', blue: '#3b82f6',
};

const input = {
    background: '#0a0e1a',
    border: `1px solid ${C.border}`,
    borderRadius: '10px',
    color: C.text,
    padding: '0.7rem 1rem',
    width: '100%',
    outline: 'none',
    fontSize: '0.95rem',
};

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '', password: '', remember: false,
    });

    useEffect(() => () => reset('password'), []);

    function submit(e) {
        e.preventDefault();
        post(route('login'));
    }

    return (
        <>
            <Head title="Connexion — My Wise Money" />

            <div style={{
                background: `radial-gradient(ellipse at top, #1a2138 0%, ${C.bg} 70%)`,
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1rem',
                position: 'relative',
                overflow: 'hidden',
            }}>

                {/* Cercles d'ambiance */}
                <div style={{
                    position: 'absolute', top: '-200px', right: '-200px',
                    width: '500px', height: '500px',
                    background: `radial-gradient(circle, ${C.gold}22 0%, transparent 70%)`,
                    borderRadius: '50%', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-200px', left: '-200px',
                    width: '500px', height: '500px',
                    background: `radial-gradient(circle, ${C.blue}22 0%, transparent 70%)`,
                    borderRadius: '50%', pointerEvents: 'none',
                }} />

                <div style={{
                    width: '100%',
                    maxWidth: '420px',
                    background: `linear-gradient(135deg, ${C.card} 0%, #0f1424 100%)`,
                    border: `1px solid ${C.gold}44`,
                    borderRadius: '20px',
                    padding: '2.5rem 2rem',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    position: 'relative',
                    zIndex: 10,
                }}>

                    {/* Logo */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <Link href="/">
                            <img src="/images/logo.png" alt="My Wise Money"
                                style={{ height: '120px', filter: `drop-shadow(0 0 24px ${C.gold}66)` }} />
                        </Link>
                    </div>

                    <h1 style={{
                        color: C.gold,
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '0.5rem',
                        letterSpacing: '0.05em',
                    }}>
                        Bon retour
                    </h1>
                    <p style={{
                        color: C.textDim,
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        marginBottom: '2rem',
                    }}>
                        Connecte-toi pour accéder à ton tableau de bord
                    </p>

                    {status && (
                        <div style={{
                            background: '#4ade8022', border: '1px solid #4ade8044',
                            color: '#4ade80', padding: '0.6rem', borderRadius: '8px',
                            fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center',
                        }}>
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit}>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ color: C.textDim, fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Email</label>
                            <input
                                style={input}
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                autoComplete="username"
                                autoFocus
                            />
                            {errors.email && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.email}</p>}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ color: C.textDim, fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Mot de passe</label>
                            <input
                                style={input}
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                autoComplete="current-password"
                            />
                            {errors.password && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.password}</p>}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.textDim, fontSize: '0.85rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    style={{ accentColor: C.gold }}
                                />
                                Se souvenir de moi
                            </label>
                            {canResetPassword && (
                                <Link href={route('password.request')} style={{ color: C.gold, fontSize: '0.85rem', textDecoration: 'none' }}>
                                    Mot de passe oublié ?
                                </Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            style={{
                                width: '100%',
                                background: `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`,
                                color: '#0a0e1a',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '0.8rem',
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                cursor: processing ? 'wait' : 'pointer',
                                opacity: processing ? 0.7 : 1,
                                boxShadow: `0 4px 16px ${C.gold}44`,
                                marginBottom: '1.5rem',
                            }}
                        >
                            {processing ? 'Connexion...' : 'Se connecter'}
                        </button>

                        <p style={{ color: C.textDim, fontSize: '0.85rem', textAlign: 'center' }}>
                            Pas encore de compte ?{' '}
                            <Link href={route('register')} style={{ color: C.gold, fontWeight: '600', textDecoration: 'none' }}>
                                Créer un compte
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
}