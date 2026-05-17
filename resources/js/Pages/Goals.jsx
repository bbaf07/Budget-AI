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
    padding: '0.55rem 1.3rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem',
    boxShadow: `0 4px 12px ${C.gold}44`,
};

const ICONS = ['🎯', '🏠', '🚗', '✈️', '💍', '🎓', '💻', '🎁', '👶', '⛵', '🏖️', '📱'];

function ModaleAction({ goal, type, onClose, symbol }) {
    const { data, setData, post, processing, reset } = useForm({ amount: '' });

    function submit(e) {
        e.preventDefault();
        const url = type === 'deposit' ? `/goals/${goal.id}/deposit` : `/goals/${goal.id}/withdraw`;
        post(url, { onSuccess: () => { reset(); onClose(); } });
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={onClose}>
            <div style={{ ...card, maxWidth: '400px', width: '90%' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ color: C.gold, fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
                    {type === 'deposit' ? '+ Ajouter' : '- Retirer'} — {goal.icon} {goal.name}
                </h3>
                <form onSubmit={submit}>
                    <label style={labelStyle}>Montant ({symbol})</label>
                    <input
                        style={input}
                        type="number"
                        step="0.01"
                        autoFocus
                        value={data.amount}
                        onChange={e => setData('amount', e.target.value)}
                        placeholder="0.00"
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose}
                            style={{ ...btnPrimary, background: 'transparent', color: C.textDim, border: `1px solid ${C.border}`, boxShadow: 'none', flex: 1 }}>
                            Annuler
                        </button>
                        <button type="submit" disabled={processing} style={{ ...btnPrimary, flex: 1 }}>
                            {processing ? '...' : 'Confirmer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Goals({ goals }) {
    const { props } = usePage();
    const locale = props.auth?.user?.locale || 'fr';
    const userCurrency = props.auth?.user?.currency || 'EUR';
    const symbol = getCurrencySymbol(userCurrency);

    const [showForm, setShowForm] = useState(false);
    const [action, setAction] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', target_amount: '', deadline: '', icon: '🎯',
    });

    function submit(e) {
        e.preventDefault();
        post('/goals', { onSuccess: () => { reset(); setShowForm(false); } });
    }

    function supprimer(id) {
        if (confirm('?')) router.delete(`/goals/${id}`);
    }

    return (
        <AuthenticatedLayout>
            <Head title="Objectifs" />
            <div style={{ background: C.bg, minHeight: '100vh', padding: '2rem 1rem' }}>
                <div style={{ maxWidth: '960px', margin: '0 auto' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h1 style={{ color: C.gold, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                            Objectifs d'épargne
                        </h1>
                        <button onClick={() => setShowForm(!showForm)} style={btnPrimary}>
                            {showForm ? '✕' : '+ Nouvel objectif'}
                        </button>
                    </div>

                    {showForm && (
                        <div style={{ ...card, marginBottom: '1.5rem' }}>
                            <h2 style={{ color: C.gold, marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>Nouvel objectif</h2>
                            <form onSubmit={submit}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>Icône</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                        {ICONS.map(ic => (
                                            <button key={ic} type="button" onClick={() => setData('icon', ic)}
                                                style={{
                                                    background: data.icon === ic ? `${C.gold}33` : 'transparent',
                                                    border: `1px solid ${data.icon === ic ? C.gold : C.border}`,
                                                    borderRadius: '8px', padding: '0.4rem 0.6rem',
                                                    fontSize: '1.1rem', cursor: 'pointer',
                                                }}>
                                                {ic}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Nom</label>
                                        <input style={input} value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Voyage Japon" />
                                        {errors.name && <p style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Objectif ({symbol})</label>
                                        <input style={input} type="number" step="0.01" value={data.target_amount} onChange={e => setData('target_amount', e.target.value)} placeholder="3000" />
                                        {errors.target_amount && <p style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.target_amount}</p>}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Échéance</label>
                                        <input style={input} type="date" value={data.deadline} onChange={e => setData('deadline', e.target.value)} />
                                    </div>
                                </div>

                                <button type="submit" disabled={processing} style={btnPrimary}>
                                    {processing ? '...' : 'Créer'}
                                </button>
                            </form>
                        </div>
                    )}

                    {goals.length === 0 ? (
                        <div style={card}>
                            <p style={{ color: C.textDim, textAlign: 'center', fontSize: '0.9rem' }}>
                                Aucun objectif. Crée ton premier projet d'épargne !
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {goals.map(g => (
                                <div key={g.id} style={card}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <span style={{ fontSize: '1.6rem' }}>{g.icon}</span>
                                            <div>
                                                <h3 style={{ color: C.gold, fontWeight: '600', fontSize: '1rem' }}>{g.name}</h3>
                                                {g.deadline && (
                                                    <p style={{ color: C.textDim, fontSize: '0.75rem', marginTop: '0.2rem' }}>
                                                        📅 {g.deadline}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => supprimer(g.id)}
                                            style={{ background: 'none', border: 'none', color: '#f8717166', cursor: 'pointer', fontSize: '1rem' }}>🗑</button>
                                    </div>

                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                                            <span style={{ color: C.text, fontSize: '1.3rem', fontWeight: 'bold' }}>
                                                {formatMoney(g.current_amount, userCurrency)}
                                            </span>
                                            <span style={{ color: C.textDim, fontSize: '0.85rem' }}>
                                                / {formatMoney(g.target_amount, userCurrency)}
                                            </span>
                                        </div>
                                        <div style={{ background: `${C.border}66`, borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${Math.min(g.percent, 100)}%`,
                                                background: g.percent >= 100 ? '#4ade80' : `linear-gradient(90deg, ${C.gold} 0%, #b8941f 100%)`,
                                                height: '10px',
                                                transition: 'width 0.4s',
                                                boxShadow: `0 0 8px ${g.percent >= 100 ? '#4ade8088' : `${C.gold}88`}`,
                                            }} />
                                        </div>
                                        <p style={{ color: g.percent >= 100 ? '#4ade80' : C.textDim, fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: '600' }}>
                                            {g.percent}% {g.percent >= 100 && '🎉 Atteint !'}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => setAction({ goal: g, type: 'deposit' })}
                                            style={{ ...btnPrimary, flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>
                                            + Ajouter
                                        </button>
                                        <button onClick={() => setAction({ goal: g, type: 'withdraw' })}
                                            style={{ background: 'transparent', color: C.textDim, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.4rem 1rem', fontSize: '0.8rem', cursor: 'pointer', flex: 1 }}>
                                            - Retirer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {action && (
                        <ModaleAction goal={action.goal} type={action.type}
                            onClose={() => setAction(null)} symbol={symbol} />
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}