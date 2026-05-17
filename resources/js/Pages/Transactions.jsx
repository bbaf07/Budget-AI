import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
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

const categories = ['Alimentation', 'Logement', 'Transport', 'Loisirs', 'Santé', 'Abonnements', 'Autre'];

const FREQ_LABELS = {
    daily:   { fr: 'Quotidien',  en: 'Daily',   icon: '📅' },
    weekly:  { fr: 'Hebdo',      en: 'Weekly',  icon: '🗓️' },
    monthly: { fr: 'Mensuel',    en: 'Monthly', icon: '📆' },
    yearly:  { fr: 'Annuel',     en: 'Yearly',  icon: '🎂' },
};

function getXsrfToken() {
    return decodeURIComponent(
        document.cookie.split('; ').find(r => r.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
    );
}

function ImportCsv() {
    const fileRef = useRef(null);
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    function submit(e) {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('csv_file', file);

        fetch('/transactions/import', {
            method: 'POST',
            headers: { 'X-XSRF-TOKEN': getXsrfToken() },
            body: formData,
        }).then(res => {
            if (res.ok || res.redirected) {
                setMessage('✓ Import OK');
                if (fileRef.current) fileRef.current.value = '';
                setFile(null);
                setTimeout(() => window.location.reload(), 1200);
            } else setMessage('✕ Erreur');
        }).finally(() => setLoading(false));
    }

    return (
        <div style={{ ...card, marginBottom: '1rem' }}>
            <h2 style={{ color: C.gold, fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Import CSV</h2>
            <p style={{ color: C.textDim, fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                Format : date, label, amount, type (income/expense), category
            </p>
            <form onSubmit={submit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input ref={fileRef} type="file" accept=".csv,.txt" onChange={e => setFile(e.target.files[0])}
                    style={{ color: C.textDim, fontSize: '0.85rem', background: '#0a0e1a', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '0.4rem 0.6rem' }} />
                <button type="submit" disabled={!file || loading}
                    style={{
                        background: file && !loading ? `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)` : C.border,
                        color: file && !loading ? '#0a0e1a' : C.textDim,
                        border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem',
                        fontWeight: 'bold', cursor: file && !loading ? 'pointer' : 'not-allowed', fontSize: '0.85rem',
                    }}>
                    {loading ? '...' : 'Importer'}
                </button>
            </form>
            {message && <p style={{ color: message.startsWith('✓') ? '#4ade80' : '#f87171', fontSize: '0.85rem', marginTop: '0.75rem' }}>{message}</p>}
        </div>
    );
}

function FormulaireRecurrente({ symbol, locale }) {
    const [show, setShow] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        label: '', amount: '', type: 'expense', category: 'Autre',
        frequency: 'monthly',
        next_date: new Date().toISOString().split('T')[0],
    });

    function submit(e) {
        e.preventDefault();
        post('/recurring', { onSuccess: () => { reset(); setShow(false); } });
    }

    return (
        <div style={{ ...card, marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: show ? '1rem' : 0 }}>
                <div>
                    <h2 style={{ color: C.gold, fontSize: '1rem', fontWeight: '600' }}>🔁 Transactions récurrentes</h2>
                    <p style={{ color: C.textDim, fontSize: '0.8rem', marginTop: '0.3rem' }}>
                        Loyer, salaires, abonnements... ajoute-les ici pour gagner du temps.
                    </p>
                </div>
                <button onClick={() => setShow(!show)}
                    style={{
                        background: show ? 'transparent' : `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`,
                        color: show ? C.textDim : '#0a0e1a',
                        border: show ? `1px solid ${C.border}` : 'none',
                        borderRadius: '8px', padding: '0.45rem 1rem',
                        fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem',
                    }}>
                    {show ? '✕' : '+ Ajouter'}
                </button>
            </div>

            {show && (
                <form onSubmit={submit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Libellé</label>
                            <input style={input} value={data.label} onChange={e => setData('label', e.target.value)} placeholder="Loyer" />
                            {errors.label && <p style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.label}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Montant ({symbol})</label>
                            <input style={input} type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} />
                            {errors.amount && <p style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.amount}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Type</label>
                            <select style={input} value={data.type} onChange={e => setData('type', e.target.value)}>
                                <option value="expense">Dépense</option>
                                <option value="income">Revenu</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Catégorie</label>
                            <select style={input} value={data.category} onChange={e => setData('category', e.target.value)}>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Fréquence</label>
                            <select style={input} value={data.frequency} onChange={e => setData('frequency', e.target.value)}>
                                <option value="daily">Quotidien</option>
                                <option value="weekly">Hebdo</option>
                                <option value="monthly">Mensuel</option>
                                <option value="yearly">Annuel</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Prochaine date</label>
                            <input style={input} type="date" value={data.next_date} onChange={e => setData('next_date', e.target.value)} />
                        </div>
                    </div>
                    <button type="submit" disabled={processing}
                        style={{
                            background: `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`,
                            color: '#0a0e1a', border: 'none', borderRadius: '8px',
                            padding: '0.55rem 1.3rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem',
                        }}>
                        {processing ? '...' : 'Créer'}
                    </button>
                </form>
            )}
        </div>
    );
}

function ListeRecurrentes({ recurring, userCurrency }) {
    if (recurring.length === 0) return null;

    function toggle(id) {
        router.post(`/recurring/${id}/toggle`);
    }

    function supprimer(id) {
        if (confirm('?')) router.delete(`/recurring/${id}`);
    }

    return (
        <div style={{ ...card, marginBottom: '1rem' }}>
            <h2 style={{ color: C.gold, fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                Mes récurrentes ({recurring.length})
            </h2>
            {recurring.map(r => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.5fr 0.5fr', gap: '0.5rem', padding: '0.6rem 0', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
                    <span style={{ color: r.active ? C.text : C.textDim, fontSize: '0.85rem' }}>{r.label}</span>
                    <span style={{ color: C.textDim, fontSize: '0.8rem' }}>
                        {FREQ_LABELS[r.frequency]?.icon} {FREQ_LABELS[r.frequency]?.fr}
                    </span>
                    <span style={{ color: C.textDim, fontSize: '0.8rem' }}>
                        📅 {r.next_date?.split('T')[0]}
                    </span>
                    <span style={{ color: r.type === 'income' ? '#4ade80' : '#f87171', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {r.type === 'income' ? '+' : '-'}{formatMoney(r.amount, userCurrency)}
                    </span>
                    <button onClick={() => toggle(r.id)}
                        style={{
                            background: r.active ? '#4ade8033' : `${C.border}66`,
                            border: `1px solid ${r.active ? '#4ade80' : C.border}`,
                            color: r.active ? '#4ade80' : C.textDim,
                            borderRadius: '6px', padding: '0.25rem 0.6rem',
                            fontSize: '0.7rem', cursor: 'pointer', fontWeight: '600',
                        }}>
                        {r.active ? 'ON' : 'OFF'}
                    </button>
                    <button onClick={() => supprimer(r.id)}
                        style={{ background: 'none', border: 'none', color: '#f8717166', cursor: 'pointer', fontSize: '1rem' }}>🗑</button>
                </div>
            ))}
        </div>
    );
}

export default function Transactions({ transactions, recurring }) {
    const { props } = usePage();
    const locale = props.auth?.user?.locale || 'fr';
    const userCurrency = props.auth?.user?.currency || 'EUR';
    const symbol = getCurrencySymbol(userCurrency);

    const [showForm, setShowForm] = useState(false);
    const [filtre, setFiltre] = useState('tous');

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

    const filtrees = transactions.filter(tx => filtre === 'tous' ? true : tx.type === filtre);

    const filterBtn = (active) => ({
        background: active ? `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)` : C.card,
        color: active ? '#0a0e1a' : C.textDim,
        border: `1px solid ${active ? C.gold : C.border}`,
        borderRadius: '8px', padding: '0.4rem 1rem',
        fontSize: '0.85rem', cursor: 'pointer', fontWeight: active ? '600' : '500',
    });

    return (
        <AuthenticatedLayout>
            <Head title={t(locale, 'transactions')} />
            <div style={{ background: C.bg, minHeight: '100vh', padding: '2rem 1rem' }}>
                <div style={{ maxWidth: '960px', margin: '0 auto' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h1 style={{ color: C.gold, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                            {t(locale, 'transactions')}
                        </h1>
                        <button onClick={() => setShowForm(!showForm)}
                            style={{
                                background: `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`,
                                color: '#0a0e1a', border: 'none', borderRadius: '8px',
                                padding: '0.55rem 1.3rem', fontWeight: 'bold', cursor: 'pointer',
                                boxShadow: `0 4px 12px ${C.gold}44`,
                            }}>
                            {showForm ? t(locale, 'cancel') : t(locale, 'add')}
                        </button>
                    </div>

                    {showForm && (
                        <div style={{ ...card, marginBottom: '1.5rem' }}>
                            <h2 style={{ color: C.gold, marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>{t(locale, 'new_transaction')}</h2>
                            <form onSubmit={submit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>{t(locale, 'label')}</label>
                                        <input style={input} value={data.label} onChange={e => setData('label', e.target.value)} />
                                        {errors.label && <p style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.label}</p>}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>{t(locale, 'amount')} ({symbol})</label>
                                        <input style={input} type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} />
                                        {errors.amount && <p style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.amount}</p>}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>{t(locale, 'type')}</label>
                                        <select style={input} value={data.type} onChange={e => setData('type', e.target.value)}>
                                            <option value="expense">{t(locale, 'expense')}</option>
                                            <option value="income">{t(locale, 'income')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>{t(locale, 'category')}</label>
                                        <select style={input} value={data.category} onChange={e => setData('category', e.target.value)}>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>{t(locale, 'date')}</label>
                                        <input style={input} type="date" value={data.date} onChange={e => setData('date', e.target.value)} />
                                    </div>
                                </div>
                                <button type="submit" disabled={processing}
                                    style={{
                                        background: `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`,
                                        color: '#0a0e1a', border: 'none', borderRadius: '8px',
                                        padding: '0.6rem 1.5rem', fontWeight: 'bold', cursor: 'pointer', opacity: processing ? 0.6 : 1,
                                    }}>
                                    {processing ? t(locale, 'saving') : t(locale, 'save')}
                                </button>
                            </form>
                        </div>
                    )}

                    <ImportCsv />
                    <FormulaireRecurrente symbol={symbol} locale={locale} />
                    <ListeRecurrentes recurring={recurring || []} userCurrency={userCurrency} />

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button onClick={() => setFiltre('tous')}    style={filterBtn(filtre === 'tous')}>{t(locale, 'transactions')}</button>
                        <button onClick={() => setFiltre('income')}  style={filterBtn(filtre === 'income')}>{t(locale, 'income')}</button>
                        <button onClick={() => setFiltre('expense')} style={filterBtn(filtre === 'expense')}>{t(locale, 'expense')}</button>
                    </div>

                    <div style={card}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 0.5fr', gap: '0.5rem', padding: '0.5rem 0', borderBottom: `1px solid ${C.gold}33`, marginBottom: '0.5rem' }}>
                            {[t(locale, 'date'), t(locale, 'label'), t(locale, 'category'), t(locale, 'amount'), ''].map(h => (
                                <span key={h} style={{ color: C.gold, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>{h}</span>
                            ))}
                        </div>
                        {filtrees.length === 0 ? (
                            <p style={{ color: C.textDim, fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>{t(locale, 'no_transactions')}</p>
                        ) : (
                            filtrees.map(tx => (
                                <div key={tx.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 0.5fr', gap: '0.5rem', padding: '0.65rem 0', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
                                    <span style={{ color: C.textDim, fontSize: '0.85rem' }}>{tx.date?.split('T')[0]}</span>
                                    <span style={{ color: C.text, fontSize: '0.85rem' }}>{tx.label}</span>
                                    <span style={{ color: C.textDim, fontSize: '0.85rem' }}>{tx.category}</span>
                                    <span style={{ color: tx.type === 'income' ? '#4ade80' : '#f87171', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount, tx.currency || userCurrency)}
                                    </span>
                                    <button onClick={() => supprimer(tx.id)} style={{ background: 'none', border: 'none', color: '#f8717166', cursor: 'pointer', fontSize: '1rem' }}>🗑</button>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}