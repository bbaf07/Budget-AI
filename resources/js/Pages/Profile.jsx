import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { t } from '@/lib/i18n';

const C = {
    bg: '#0a0e1a', card: '#141929', border: '#1e2a4a',
    gold: '#d4af37', text: '#e8eef7', textDim: '#8b9bb8', blue: '#3b82f6',
};

const card = {
    background: `linear-gradient(135deg, ${C.card} 0%, #0f1424 100%)`,
    border: `1px solid ${C.border}`,
    borderRadius: '14px',
    padding: '1.5rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
};

const input = {
    background: '#0a0e1a', border: `1px solid ${C.border}`,
    borderRadius: '8px', color: C.text,
    padding: '0.6rem 0.85rem', width: '100%', outline: 'none',
    fontSize: '0.9rem',
};

const labelStyle = {
    color: C.textDim, fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem',
};

const btnPrimary = {
    background: `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`,
    color: '#0a0e1a',
    border: 'none',
    borderRadius: '8px',
    padding: '0.6rem 1.5rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem',
    boxShadow: `0 4px 12px ${C.gold}44`,
};

function FormulaireProfile({ user, locale }) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    function submit(e) {
        e.preventDefault();
        patch('/profile');
    }

    return (
        <div style={card}>
            <h2 style={{ color: C.gold, fontSize: '1rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                Informations personnelles
            </h2>
            <p style={{ color: C.textDim, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Modifie ton nom et ton email.
            </p>

            <form onSubmit={submit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Nom</label>
                    <input style={input} value={data.name} onChange={e => setData('name', e.target.value)} />
                    {errors.name && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.name}</p>}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>Email</label>
                    <input style={input} type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                    {errors.email && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.email}</p>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button type="submit" disabled={processing} style={btnPrimary}>
                        {processing ? '...' : t(locale, 'save')}
                    </button>
                    {recentlySuccessful && (
                        <span style={{ color: '#4ade80', fontSize: '0.85rem' }}>✓ Enregistré</span>
                    )}
                </div>
            </form>
        </div>
    );
}

function FormulaireMotDePasse({ locale }) {
    const { data, setData, patch, processing, errors, reset, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        patch('/profile/password', { onSuccess: () => reset() });
    }

    return (
        <div style={card}>
            <h2 style={{ color: C.gold, fontSize: '1rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                Mot de passe
            </h2>
            <p style={{ color: C.textDim, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Pour sécuriser ton compte, utilise un mot de passe long et unique.
            </p>

            <form onSubmit={submit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Mot de passe actuel</label>
                    <input style={input} type="password" value={data.current_password} onChange={e => setData('current_password', e.target.value)} />
                    {errors.current_password && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.current_password}</p>}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Nouveau mot de passe</label>
                    <input style={input} type="password" value={data.password} onChange={e => setData('password', e.target.value)} />
                    {errors.password && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.password}</p>}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>Confirmer le nouveau mot de passe</label>
                    <input style={input} type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button type="submit" disabled={processing} style={btnPrimary}>
                        {processing ? '...' : 'Modifier'}
                    </button>
                    {recentlySuccessful && (
                        <span style={{ color: '#4ade80', fontSize: '0.85rem' }}>✓ Modifié</span>
                    )}
                </div>
            </form>
        </div>
    );
}

function SupprimerCompte() {
    const [showConfirm, setShowConfirm] = useState(false);
    const { data, setData, delete: destroy, processing, errors, reset } = useForm({ password: '' });

    function submit(e) {
        e.preventDefault();
        destroy('/profile');
    }

    return (
        <div style={{ ...card, border: `1px solid #f8717144` }}>
            <h2 style={{ color: '#f87171', fontSize: '1rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                Zone dangereuse
            </h2>
            <p style={{ color: C.textDim, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Une fois ton compte supprimé, toutes tes données seront perdues définitivement.
            </p>

            {!showConfirm ? (
                <button onClick={() => setShowConfirm(true)}
                    style={{
                        background: 'transparent',
                        color: '#f87171',
                        border: `1px solid #f87171`,
                        borderRadius: '8px',
                        padding: '0.55rem 1.3rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                    }}>
                    Supprimer mon compte
                </button>
            ) : (
                <form onSubmit={submit}>
                    <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        Confirme avec ton mot de passe :
                    </p>
                    <input style={input} type="password" autoFocus value={data.password} onChange={e => setData('password', e.target.value)} placeholder="Mot de passe" />
                    {errors.password && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.password}</p>}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button type="button" onClick={() => { setShowConfirm(false); reset(); }}
                            style={{
                                background: 'transparent', color: C.textDim,
                                border: `1px solid ${C.border}`, borderRadius: '8px',
                                padding: '0.55rem 1.3rem', cursor: 'pointer', fontSize: '0.85rem', flex: 1,
                            }}>
                            Annuler
                        </button>
                        <button type="submit" disabled={processing}
                            style={{
                                background: '#f87171', color: '#0a0e1a',
                                border: 'none', borderRadius: '8px',
                                padding: '0.55rem 1.3rem', fontWeight: 'bold',
                                cursor: 'pointer', fontSize: '0.85rem', flex: 1,
                            }}>
                            {processing ? '...' : 'Confirmer'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default function Profile({ user }) {
    const { props } = usePage();
    const locale = props.auth?.user?.locale || 'fr';

    return (
        <AuthenticatedLayout>
            <Head title={t(locale, 'profile')} />
            <div style={{ background: C.bg, minHeight: '100vh', padding: '2rem 1rem' }}>
                <div style={{ maxWidth: '720px', margin: '0 auto' }}>

                    <h1 style={{ color: C.gold, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                        {t(locale, 'profile')}
                    </h1>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <FormulaireProfile user={user} locale={locale} />
                        <FormulaireMotDePasse locale={locale} />
                        <SupprimerCompte />
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}