import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import WeatherWidget from '@/Components/WeatherWidget';
import { t, formatMoney, getCurrencySymbol } from '@/lib/i18n';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell
} from 'recharts';

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
const COLORS = ['#d4af37', '#3b82f6', '#4ade80', '#f87171', '#a78bfa', '#fb923c', '#facc15'];

function PrevisionCard({ prevision, userCurrency, locale }) {
    if (!prevision || (prevision.revenus === 0 && prevision.depenses === 0)) return null;

    const surplus = prevision.solde >= 0;

    return (
        <div style={{ ...card, marginBottom: '1.5rem', border: `1px solid ${C.gold}66`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', background: `radial-gradient(circle, ${C.gold}22 0%, transparent 70%)`, pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🔮</span>
                <div>
                    <h2 style={{ color: C.gold, fontSize: '1rem', fontWeight: '600', letterSpacing: '0.03em' }}>
                        Prévision pour le mois prochain
                    </h2>
                    <p style={{ color: C.textDim, fontSize: '0.75rem' }}>
                        Basée sur tes 3 derniers mois d'activité
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ background: `${C.bg}66`, borderRadius: '10px', padding: '0.9rem' }}>
                    <p style={{ color: C.textDim, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                        Revenus prévus
                    </p>
                    <p style={{ color: '#4ade80', fontSize: '1.15rem', fontWeight: 'bold' }}>
                        {formatMoney(prevision.revenus, userCurrency)}
                    </p>
                </div>
                <div style={{ background: `${C.bg}66`, borderRadius: '10px', padding: '0.9rem' }}>
                    <p style={{ color: C.textDim, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                        Dépenses prévues
                    </p>
                    <p style={{ color: '#f87171', fontSize: '1.15rem', fontWeight: 'bold' }}>
                        {formatMoney(prevision.depenses, userCurrency)}
                    </p>
                </div>
                <div style={{ background: `${C.bg}66`, borderRadius: '10px', padding: '0.9rem' }}>
                    <p style={{ color: C.textDim, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                        Solde prévu
                    </p>
                    <p style={{ color: surplus ? '#4ade80' : '#f87171', fontSize: '1.15rem', fontWeight: 'bold' }}>
                        {surplus ? '+' : ''}{formatMoney(prevision.solde, userCurrency)}
                    </p>
                </div>
            </div>

            <p style={{ color: surplus ? '#4ade80' : '#f87171', fontSize: '0.8rem', marginTop: '0.85rem', textAlign: 'center', fontWeight: '500' }}>
                {surplus
                    ? `✓ Tu devrais épargner environ ${formatMoney(prevision.solde, userCurrency)} le mois prochain.`
                    : `⚠ Attention, tu risques d'être en négatif de ${formatMoney(Math.abs(prevision.solde), userCurrency)}.`}
            </p>
        </div>
    );
}

export default function Dashboard({ transactions, revenus, depenses, solde, parMois, parCategorie, prevision }) {
    const { props } = usePage();
    const locale = props.auth?.user?.locale || 'fr';
    const userCurrency = props.auth?.user?.currency || 'EUR';
    const symbol = getCurrencySymbol(userCurrency);

    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        label: '', amount: '', type: 'expense', category: 'Autre',
        date: new Date().toISOString().split('T')[0],
    });

    function submit(e) {
        e.preventDefault();
        post('/transactions', { onSuccess: () => { reset(); setShowForm(false); } });
    }

    function supprimer(id) {
        if (confirm('?')) router.delete(`/transactions/${id}`);
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={{ background: C.card, border: `1px solid ${C.gold}44`, borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <p style={{ color: C.gold, fontWeight: '600', marginBottom: '0.3rem' }}>{label}</p>
                {payload.map(p => (
                    <p key={p.name} style={{ color: p.color, fontSize: '0.85rem' }}>{p.name} : {formatMoney(p.value, userCurrency)}</p>
                ))}
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={t(locale, 'dashboard')} />
            <div style={{ background: C.bg, minHeight: '100vh', padding: '2rem 1rem' }}>
                <div style={{ maxWidth: '960px', margin: '0 auto' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h1 style={{ color: C.gold, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                            {t(locale, 'dashboard')}
                        </h1>
                        <button onClick={() => setShowForm(!showForm)}
                            style={{ background: `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`, color: '#0a0e1a', border: 'none', borderRadius: '8px', padding: '0.55rem 1.3rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: `0 4px 12px ${C.gold}44` }}>
                            {showForm ? t(locale, 'cancel') : t(locale, 'add')}
                        </button>
                    </div>

                    <div style={{ marginBottom: '1rem' }}><WeatherWidget /></div>

                    {showForm && (
                        <div style={{ ...card, marginBottom: '1.5rem' }}>
                            <h2 style={{ color: C.gold, marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>{t(locale, 'new_transaction')}</h2>
                            <form onSubmit={submit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ color: C.textDim, fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>{t(locale, 'label')}</label>
                                        <input style={input} value={data.label} onChange={e => setData('label', e.target.value)} />
                                        {errors.label && <p style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.label}</p>}
                                    </div>
                                    <div>
                                        <label style={{ color: C.textDim, fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>{t(locale, 'amount')} ({symbol})</label>
                                        <input style={input} type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} />
                                        {errors.amount && <p style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.amount}</p>}
                                    </div>
                                    <div>
                                        <label style={{ color: C.textDim, fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>{t(locale, 'type')}</label>
                                        <select style={input} value={data.type} onChange={e => setData('type', e.target.value)}>
                                            <option value="expense">{t(locale, 'expense')}</option>
                                            <option value="income">{t(locale, 'income')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ color: C.textDim, fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>{t(locale, 'category')}</label>
                                        <select style={input} value={data.category} onChange={e => setData('category', e.target.value)}>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ color: C.textDim, fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>{t(locale, 'date')}</label>
                                        <input style={input} type="date" value={data.date} onChange={e => setData('date', e.target.value)} />
                                    </div>
                                </div>
                                <button type="submit" disabled={processing}
                                    style={{ background: `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`, color: '#0a0e1a', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: 'bold', cursor: 'pointer', opacity: processing ? 0.6 : 1 }}>
                                    {processing ? t(locale, 'saving') : t(locale, 'save')}
                                </button>
                            </form>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[
                            [t(locale, 'revenus'), revenus, '#4ade80'],
                            [t(locale, 'depenses'), depenses, '#f87171'],
                            [t(locale, 'solde'), solde, solde >= 0 ? '#4ade80' : '#f87171'],
                        ].map(([lbl, val, color]) => (
                            <div key={lbl} style={card}>
                                <p style={{ color: C.gold, fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', letterSpacing: '0.03em' }}>{lbl}</p>
                                <p style={{ color, fontSize: '1.7rem', fontWeight: 'bold' }}>{formatMoney(val, userCurrency)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Prévision IA */}
                    <PrevisionCard prevision={prevision} userCurrency={userCurrency} locale={locale} />

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={card}>
                            <h2 style={{ color: C.gold, fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>{t(locale, 'revenue_vs_expenses')}</h2>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={parMois}>
                                    <XAxis dataKey="mois" tick={{ fill: C.textDim, fontSize: 11 }} />
                                    <YAxis tick={{ fill: C.textDim, fontSize: 11 }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: `${C.gold}11` }} />
                                    <Legend wrapperStyle={{ color: C.textDim, fontSize: '0.8rem' }} />
                                    <Bar dataKey="revenus"  name={t(locale, 'income')}  fill="#4ade80" radius={[4,4,0,0]} />
                                    <Bar dataKey="depenses" name={t(locale, 'expense')} fill="#f87171" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={card}>
                            <h2 style={{ color: C.gold, fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>{t(locale, 'expenses_this_month')}</h2>
                            {parCategorie.length === 0 ? (
                                <p style={{ color: C.textDim, fontSize: '0.85rem', textAlign: 'center', marginTop: '3rem' }}>{t(locale, 'no_expenses_month')}</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={parCategorie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                            {parCategorie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ color: C.textDim, fontSize: '0.75rem' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div style={card}>
                        <h2 style={{ color: C.gold, fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>{t(locale, 'recent_transactions')}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 0.5fr', gap: '0.5rem', padding: '0.5rem 0', borderBottom: `1px solid ${C.gold}33`, marginBottom: '0.5rem' }}>
                            {[t(locale, 'date'), t(locale, 'label'), t(locale, 'category'), t(locale, 'amount'), ''].map(h => (
                                <span key={h} style={{ color: C.gold, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>{h}</span>
                            ))}
                        </div>
                        {transactions.length === 0 ? (
                            <p style={{ color: C.textDim, fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>{t(locale, 'no_transactions')}</p>
                        ) : (
                            transactions.map(tr => (
                                <div key={tr.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 0.5fr', gap: '0.5rem', padding: '0.65rem 0', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
                                    <span style={{ color: C.textDim, fontSize: '0.85rem' }}>{tr.date?.split('T')[0]}</span>
                                    <span style={{ color: C.text, fontSize: '0.85rem' }}>{tr.label}</span>
                                    <span style={{ color: C.textDim, fontSize: '0.85rem' }}>{tr.category}</span>
                                    <span style={{ color: tr.type === 'income' ? '#4ade80' : '#f87171', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        {tr.type === 'income' ? '+' : '-'}{formatMoney(tr.amount, tr.currency || userCurrency)}
                                    </span>
                                    <button onClick={() => supprimer(tr.id)} style={{ background: 'none', border: 'none', color: '#f8717166', cursor: 'pointer', fontSize: '1rem' }}>🗑</button>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}