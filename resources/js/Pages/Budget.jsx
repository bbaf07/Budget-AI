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

const categories = ['Alimentation', 'Logement', 'Transport', 'Loisirs', 'Santé', 'Abonnements', 'Autre'];

function BarreProgression({ percent }) {
    const couleur = percent >= 100 ? '#f87171' : percent >= 75 ? '#facc15' : '#4ade80';
    return (
        <div style={{ background: `${C.border}66`, borderRadius: '999px', height: '8px', width: '100%', marginTop: '0.5rem', overflow: 'hidden' }}>
            <div style={{
                width: `${Math.min(percent, 100)}%`,
                background: couleur,
                borderRadius: '999px',
                height: '8px',
                transition: 'width 0.4s ease',
                boxShadow: `0 0 8px ${couleur}88`,
            }} />
        </div>
    );
}

export default function Budget({ budgets }) {
    const { props } = usePage();
    const locale = props.auth?.user?.locale || 'fr';
    const userCurrency = props.auth?.user?.currency || 'EUR';
    const symbol = getCurrencySymbol(userCurrency);

    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        category: 'Alimentation',
        limit_amount: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/budget', { onSuccess: () => { reset(); setShowForm(false); } });
    }

    function supprimer(id) {
        if (confirm('?')) router.delete(`/budget/${id}`);
    }

    return (
        <AuthenticatedLayout>
            <Head title={t(locale, 'budget')} />
            <div style={{ background: C.bg, minHeight: '100vh', padding: '2rem 1rem' }}>
                <div style={{ maxWidth: '960px', margin: '0 auto' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h1 style={{ color: C.gold, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                            {t(locale, 'budget')}
                        </h1>
                        <button onClick={() => setShowForm(!showForm)}
                            style={{ background: `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`, color: '#0a0e1a', border: 'none', borderRadius: '8px', padding: '0.55rem 1.3rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: `0 4px 12px ${C.gold}44` }}>
                            {showForm ? t(locale, 'cancel') : t(locale, 'add')}
                        </button>
                    </div>

                    {showForm && (
                        <div style={{ ...card, marginBottom: '1.5rem' }}>
                            <h2 style={{ color: C.gold, marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
                                {t(locale, 'budget')}
                            </h2>
                            <form onSubmit={submit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ color: C.textDim, fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>{t(locale, 'category')}</label>
                                        <select style={input} value={data.category} onChange={e => setData('category', e.target.value)}>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ color: C.textDim, fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>{t(locale, 'amount')} ({symbol})</label>
                                        <input style={input} type="number" step="0.01" value={data.limit_amount} onChange={e => setData('limit_amount', e.target.value)} />
                                        {errors.limit_amount && <p style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.limit_amount}</p>}
                                    </div>
                                </div>
                                <button type="submit" disabled={processing}
                                    style={{ background: `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`, color: '#0a0e1a', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: 'bold', cursor: 'pointer', opacity: processing ? 0.6 : 1 }}>
                                    {processing ? t(locale, 'saving') : t(locale, 'save')}
                                </button>
                            </form>
                        </div>
                    )}

                    {budgets.length === 0 ? (
                        <div style={card}>
                            <p style={{ color: C.textDim, textAlign: 'center', fontSize: '0.9rem' }}>—</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                            {budgets.map(b => (
                                <div key={b.id} style={card}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <h3 style={{ color: C.gold, fontWeight: '600', fontSize: '1rem' }}>{b.category}</h3>
                                        <button onClick={() => supprimer(b.id)}
                                            style={{ background: 'none', border: 'none', color: '#f8717166', cursor: 'pointer', fontSize: '1rem' }}>🗑</button>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <span style={{ color: b.percent >= 100 ? '#f87171' : b.percent >= 75 ? '#facc15' : C.text, fontSize: '1.4rem', fontWeight: 'bold' }}>
                                            {formatMoney(b.spent, userCurrency)}
                                        </span>
                                        <span style={{ color: C.textDim, fontSize: '0.85rem' }}>
                                            / {formatMoney(b.limit_amount, userCurrency)}
                                        </span>
                                    </div>
                                    <BarreProgression percent={b.percent} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                        <span style={{ color: C.textDim, fontSize: '0.75rem' }}>{b.percent}%</span>
                                        {b.percent >= 100 && <span style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: '600' }}>⚠</span>}
                                        {b.percent >= 75 && b.percent < 100 && <span style={{ color: '#facc15', fontSize: '0.75rem', fontWeight: '600' }}>⚡</span>}
                                        {b.percent < 75 && <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: '600' }}>✓</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}