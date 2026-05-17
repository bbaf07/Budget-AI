import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { t, formatMoney, getCurrencySymbol } from '@/lib/i18n';

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
    padding: '0.55rem 0.85rem', width: '100%', outline: 'none',
    fontSize: '0.9rem',
};

const labelStyle = {
    color: C.textDim, fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem',
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

const tabStyle = (active) => ({
    background: active ? `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)` : 'transparent',
    color: active ? '#0a0e1a' : C.textDim,
    border: `1px solid ${active ? C.gold : C.border}`,
    borderRadius: '8px',
    padding: '0.5rem 1.2rem',
    fontWeight: active ? 'bold' : 'normal',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
});

function FormulaireEnvoiUtilisateur({ locale, symbol }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        email: '', amount: '', label: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/money/send-user', { onSuccess: () => reset() });
    }

    return (
        <form onSubmit={submit}>
            <p style={{ color: C.textDim, fontSize: '0.85rem', marginBottom: '1rem' }}>
                Transfert immédiat à un autre utilisateur BudgetAI.
            </p>

            <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Email</label>
                <input style={input} value={data.email} onChange={e => setData('email', e.target.value)} placeholder="ami@exemple.com" />
                {errors.email && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.email}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={labelStyle}>{t(locale, 'amount')} ({symbol})</label>
                    <input style={input} type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} placeholder="50.00" />
                    {errors.amount && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.amount}</p>}
                </div>
                <div>
                    <label style={labelStyle}>{t(locale, 'label')}</label>
                    <input style={input} value={data.label} onChange={e => setData('label', e.target.value)} />
                </div>
            </div>

            <button type="submit" disabled={processing} style={btnPrimary}>
                {processing ? t(locale, 'saving') : t(locale, 'send')}
            </button>
        </form>
    );
}

function FormulaireEnvoiIban({ locale, symbol }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        iban: '', amount: '', label: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/money/send-iban', { onSuccess: () => reset() });
    }

    return (
        <form onSubmit={submit}>
            <p style={{ color: C.textDim, fontSize: '0.85rem', marginBottom: '1rem' }}>
                Virement vers un compte externe (IBAN).
            </p>

            <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>IBAN</label>
                <input style={input} value={data.iban} onChange={e => setData('iban', e.target.value)} placeholder="FR76 1234 5678 9012 3456 7890 123" />
                {errors.iban && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.iban}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={labelStyle}>{t(locale, 'amount')} ({symbol})</label>
                    <input style={input} type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} placeholder="100.00" />
                    {errors.amount && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.amount}</p>}
                </div>
                <div>
                    <label style={labelStyle}>{t(locale, 'label')}</label>
                    <input style={input} value={data.label} onChange={e => setData('label', e.target.value)} />
                </div>
            </div>

            <button type="submit" disabled={processing} style={btnPrimary}>
                {processing ? t(locale, 'saving') : t(locale, 'send')}
            </button>
        </form>
    );
}

function FormulaireDemande({ locale, symbol }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        email: '', amount: '', message: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/money/request', { onSuccess: () => reset() });
    }

    return (
        <form onSubmit={submit}>
            <p style={{ color: C.textDim, fontSize: '0.85rem', marginBottom: '1rem' }}>
                Demande à un utilisateur — il doit accepter pour que le transfert soit effectué.
            </p>

            <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Email</label>
                <input style={input} value={data.email} onChange={e => setData('email', e.target.value)} placeholder="ami@exemple.com" />
                {errors.email && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.email}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={labelStyle}>{t(locale, 'amount')} ({symbol})</label>
                    <input style={input} type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} placeholder="20.00" />
                    {errors.amount && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.amount}</p>}
                </div>
                <div>
                    <label style={labelStyle}>Message</label>
                    <input style={input} value={data.message} onChange={e => setData('message', e.target.value)} />
                </div>
            </div>

            <button type="submit" disabled={processing} style={btnPrimary}>
                {processing ? t(locale, 'saving') : t(locale, 'send')}
            </button>
        </form>
    );
}

export default function Money({ demandesRecues, demandesEnvoyees }) {
    const { props } = usePage();
    const locale = props.auth?.user?.locale || 'fr';
    const userCurrency = props.auth?.user?.currency || 'EUR';
    const symbol = getCurrencySymbol(userCurrency);

    const [tab, setTab] = useState('send-user');

    function accepter(id) {
        if (confirm('?')) router.post(`/money/accept/${id}`);
    }

    function refuser(id) {
        if (confirm('?')) router.post(`/money/decline/${id}`);
    }

    return (
        <AuthenticatedLayout>
            <Head title={t(locale, 'send')} />
            <div style={{ background: C.bg, minHeight: '100vh', padding: '2rem 1rem' }}>
                <div style={{ maxWidth: '960px', margin: '0 auto' }}>

                    <h1 style={{ color: C.gold, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                        {t(locale, 'send')}
                    </h1>

                    {demandesRecues.length > 0 && (
                        <div style={{ ...card, marginBottom: '1.5rem', border: `1px solid #facc1566`, boxShadow: '0 4px 20px rgba(250, 204, 21, 0.15)' }}>
                            <h2 style={{ color: '#facc15', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                                Notifications ({demandesRecues.length})
                            </h2>
                            {demandesRecues.map(d => (
                                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: `1px solid ${C.border}` }}>
                                    <div>
                                        <p style={{ color: C.text, fontSize: '0.9rem', fontWeight: '600' }}>
                                            {d.from_user?.name} — {formatMoney(d.amount, userCurrency)}
                                        </p>
                                        {d.message && (
                                            <p style={{ color: C.textDim, fontSize: '0.8rem', marginTop: '0.2rem' }}>« {d.message} »</p>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => accepter(d.id)}
                                            style={{ background: '#4ade80', color: '#0a0e1a', border: 'none', borderRadius: '6px', padding: '0.35rem 0.8rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>✓</button>
                                        <button onClick={() => refuser(d.id)}
                                            style={{ background: '#f87171', color: '#0a0e1a', border: 'none', borderRadius: '6px', padding: '0.35rem 0.8rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => setTab('send-user')} style={tabStyle(tab === 'send-user')}>{t(locale, 'send')}</button>
                        <button onClick={() => setTab('send-iban')} style={tabStyle(tab === 'send-iban')}>IBAN</button>
                        <button onClick={() => setTab('request')}   style={tabStyle(tab === 'request')}>Request</button>
                    </div>

                    <div style={card}>
                        {tab === 'send-user' && <FormulaireEnvoiUtilisateur locale={locale} symbol={symbol} />}
                        {tab === 'send-iban'  && <FormulaireEnvoiIban       locale={locale} symbol={symbol} />}
                        {tab === 'request'    && <FormulaireDemande         locale={locale} symbol={symbol} />}
                    </div>

                    {demandesEnvoyees.length > 0 && (
                        <div style={{ ...card, marginTop: '1.5rem' }}>
                            <h2 style={{ color: C.gold, fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>History</h2>
                            {demandesEnvoyees.map(d => (
                                <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', padding: '0.65rem 0', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
                                    <span style={{ color: C.text, fontSize: '0.85rem' }}>{d.to_user?.name}</span>
                                    <span style={{ color: C.gold, fontSize: '0.85rem', fontWeight: 'bold' }}>{formatMoney(d.amount, userCurrency)}</span>
                                    <span style={{ color: C.textDim, fontSize: '0.8rem' }}>{d.message || '—'}</span>
                                    <span style={{
                                        color: d.status === 'accepted' ? '#4ade80' : d.status === 'declined' ? '#f87171' : '#facc15',
                                        fontSize: '0.8rem', fontWeight: '600',
                                    }}>
                                        {d.status === 'accepted' ? '✓' : d.status === 'declined' ? '✕' : '⏳'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}