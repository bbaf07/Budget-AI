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

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', password: '', password_confirmation: '',
    });

    useEffect(() => () => reset('password', 'password_confirmation'), []);

    function submit(e) {
        e.preventDefault();
        post(route('register'));
    }

    return (
        <>
            <Head title="Inscription — My Wise Money" />

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
                        Bienvenue
                    </h1>
                    <p style={{
                        color: C.textDim,
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        marginBottom: '2rem',
                    }}>
                        Crée ton compte en 30 secondes
                    </p>

                    <form onSubmit={submit}>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ color: C.textDim, fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Nom</label>
                            <input
                                style={input}
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                autoComplete="name"
                                autoFocus
                            />
                            {errors.name && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.name}</p>}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ color: C.textDim, fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Email</label>
                            <input
                                style={input}
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                autoComplete="username"
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
                                autoComplete="new-password"
                            />
                            {errors.password && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.password}</p>}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ color: C.textDim, fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Confirmer le mot de passe</label>
                            <input
                                style={input}
                                type="password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                            />
                            {errors.password_confirmation && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.password_confirmation}</p>}
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
                            {processing ? 'Création...' : 'Créer mon compte'}
                        </button>

                        <p style={{ color: C.textDim, fontSize: '0.85rem', textAlign: 'center' }}>
                            Déjà un compte ?{' '}
                            <Link href={route('login')} style={{ color: C.gold, fontWeight: '600', textDecoration: 'none' }}>
                                Se connecter
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
}