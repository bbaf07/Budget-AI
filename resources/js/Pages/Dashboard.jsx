import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell
} from 'recharts';

const card = {
    background: '#1a1a1a',
    border: '1px solid #c9a84c44',
    borderRadius: '12px',
    padding: '1.5rem',
};

const input = {
    background: '#111',
    border: '1px solid #c9a84c44',
    borderRadius: '8px',
    color: '#ffffff',
    padding: '0.5rem 0.75rem',
    width: '100%',
    outline: 'none',
};

const categories = [
    'Alimentation', 'Logement', 'Transport',
    'Loisirs', 'Santé', 'Abonnements', 'Autre'
];

const COLORS = ['#c9a84c', '#4ade80', '#f87171', '#60a5fa', '#facc15', '#a78bfa', '#fb923c'];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#1a1a1a', border: '1px solid #c9a84c44', borderRadius: '8px', padding: '0.75rem 1rem' }}>
            <p style={{ color: '#c9a84c', fontWeight: '600', marginBottom: '0.3rem' }}>{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color, fontSize: '0.85rem' }}>
                    {p.name} : {Number(p.value).toFixed(2)} €
                </p>
            ))}
        </div>
    );
};

export default function Dashboard({ transactions, revenus, depenses, solde, parMois, parCategorie }) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        label:    '',
        amount:   '',
        type:     'expense',
        category: 'Autre',
        date:     new Date().toISOString().split('T')[0],
    });

    function submit(e) {
        e.preventDefault();
        post('/transactions', {
            onSuccess: () => { reset(); setShowForm(false); }
        });
    }

    function supprimer(id) {
        if (confirm('Supprimer cette transaction ?')) {
            router.delete(`/transactions/${id}`);
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div style={{ background: '#0f0f0f', minHeight: '100vh', padding: '2rem 1rem' }}>
                <div style={{ maxWidth: '960px', margin: '0 auto' }}>

                    {/* Titre + bouton */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h1 style={{ color: '#c9a84c', fontSize: '1.4rem', fontWeight: 'bold' }}>
                            Tableau de bord
                        </h1>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            style={{ background: '#c9a84c', color: '#0f0f0f', border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {showForm ? '✕ Annuler' : '+ Ajouter'}
                        </button>
                    </div>

                    {/* Formulaire */}
                    {showForm && (
                        <div style={{ ...card, marginBottom: '1.5rem' }}>
                            <h2 style={{ color: '#c9a84c', marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
                                Nouvelle transaction
                            </h2>
                            <form onSubmit={submit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ color: '#ffffff66', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>Libellé</label>
                                        <input style={input} value={data.label} onChange={e => setData('label', e.target.value)} placeholder="Ex: Courses Carrefour" />
                                        {errors.label && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.label}</p>}
                                    </div>
                                    <div>
                                        <label style={{ color: '#ffffff66', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>Montant (€)</label>
                                        <input style={input} type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} placeholder="0.00" />
                                        {errors.amount && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.amount}</p>}
                                    </div>
                                    <div>
                                        <label style={{ color: '#ffffff66', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>Type</label>
                                        <select style={input} value={data.type} onChange={e => setData('type', e.target.value)}>
                                            <option value="expense">Dépense</option>
                                            <option value="income">Revenu</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ color: '#ffffff66', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>Catégorie</label>
                                        <select style={input} value={data.category} onChange={e => setData('category', e.target.value)}>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ color: '#ffffff66', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>Date</label>
                                        <input style={input} type="date" value={data.date} onChange={e => setData('date', e.target.value)} />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    style={{ background: '#c9a84c', color: '#0f0f0f', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: 'bold', cursor: 'pointer', opacity: processing ? 0.6 : 1 }}
                                >
                                    {processing ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Cartes résumé */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={card}>
                            <p style={{ color: '#c9a84c', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Revenus du mois</p>
                            <p style={{ color: '#4ade80', fontSize: '1.6rem', fontWeight: 'bold' }}>{Number(revenus).toFixed(2)} €</p>
                        </div>
                        <div style={card}>
                            <p style={{ color: '#c9a84c', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Dépenses du mois</p>
                            <p style={{ color: '#f87171', fontSize: '1.6rem', fontWeight: 'bold' }}>{Number(depenses).toFixed(2)} €</p>
                        </div>
                        <div style={card}>
                            <p style={{ color: '#c9a84c', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Solde</p>
                            <p style={{ color: solde >= 0 ? '#4ade80' : '#f87171', fontSize: '1.6rem', fontWeight: 'bold' }}>
                                {Number(solde).toFixed(2)} €
                            </p>
                        </div>
                    </div>

                    {/* Graphiques */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>

                        {/* Barres revenus vs dépenses */}
                        <div style={card}>
                            <h2 style={{ color: '#c9a84c', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                                Revenus vs Dépenses (6 mois)
                            </h2>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={parMois}>
                                    <XAxis dataKey="mois" tick={{ fill: '#ffffff66', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#ffffff66', fontSize: 11 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: '#ffffff88', fontSize: '0.8rem' }} />
                                    <Bar dataKey="revenus"  name="Revenus"  fill="#4ade80" radius={[4,4,0,0]} />
                                    <Bar dataKey="depenses" name="Dépenses" fill="#f87171" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Camembert catégories */}
                        <div style={card}>
                            <h2 style={{ color: '#c9a84c', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                                Dépenses ce mois
                            </h2>
                            {parCategorie.length === 0 ? (
                                <p style={{ color: '#ffffff33', fontSize: '0.85rem', textAlign: 'center', marginTop: '3rem' }}>
                                    Aucune dépense ce mois.
                                </p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={parCategorie}
                                            cx="50%" cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {parCategorie.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ color: '#ffffff88', fontSize: '0.75rem' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Tableau transactions */}
                    <div style={card}>
                        <h2 style={{ color: '#c9a84c', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                            Dernières transactions
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 0.5fr', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid #c9a84c33', marginBottom: '0.5rem' }}>
                            {['Date', 'Libellé', 'Catégorie', 'Montant', ''].map(h => (
                                <span key={h} style={{ color: '#c9a84c', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>{h}</span>
                            ))}
                        </div>
                        {transactions.length === 0 ? (
                            <p style={{ color: '#ffffff44', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
                                Aucune transaction pour le moment.
                            </p>
                        ) : (
                            transactions.map(t => (
                                <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 0.5fr', gap: '0.5rem', padding: '0.6rem 0', borderBottom: '1px solid #ffffff11', alignItems: 'center' }}>
                                    <span style={{ color: '#ffffff88', fontSize: '0.85rem' }}>{t.date}</span>
                                    <span style={{ color: '#ffffff', fontSize: '0.85rem' }}>{t.label}</span>
                                    <span style={{ color: '#ffffff66', fontSize: '0.85rem' }}>{t.category}</span>
                                    <span style={{ color: t.type === 'income' ? '#4ade80' : '#f87171', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        {t.type === 'income' ? '+' : '-'}{Number(t.amount).toFixed(2)} €
                                    </span>
                                    <button
                                        onClick={() => supprimer(t.id)}
                                        style={{ background: 'none', border: 'none', color: '#f8717166', cursor: 'pointer', fontSize: '1rem' }}
                                    >
                                        🗑
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}