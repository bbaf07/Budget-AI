import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

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

function BarreProgression({ percent }) {
    const couleur = percent >= 100 ? '#f87171' : percent >= 75 ? '#facc15' : '#4ade80';
    return (
        <div style={{ background: '#ffffff11', borderRadius: '999px', height: '8px', width: '100%', marginTop: '0.5rem' }}>
            <div style={{
                width: `${Math.min(percent, 100)}%`,
                background: couleur,
                borderRadius: '999px',
                height: '8px',
                transition: 'width 0.4s ease',
            }} />
        </div>
    );
}

export default function Budget({ budgets }) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        category:     'Alimentation',
        limit_amount: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/budget', {
            onSuccess: () => { reset(); setShowForm(false); }
        });
    }

    function supprimer(id) {
        if (confirm('Supprimer ce budget ?')) {
            router.delete(`/budget/${id}`);
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="Budget" />

            <div style={{ background: '#0f0f0f', minHeight: '100vh', padding: '2rem 1rem' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                    {/* Titre + bouton */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h1 style={{ color: '#c9a84c', fontSize: '1.4rem', fontWeight: 'bold' }}>
                            Budgets par catégorie
                        </h1>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            style={{ background: '#c9a84c', color: '#0f0f0f', border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {showForm ? '✕ Annuler' : '+ Nouveau budget'}
                        </button>
                    </div>

                    {/* Formulaire */}
                    {showForm && (
                        <div style={{ ...card, marginBottom: '1.5rem' }}>
                            <h2 style={{ color: '#c9a84c', marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
                                Définir un plafond
                            </h2>
                            <form onSubmit={submit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ color: '#ffffff66', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>Catégorie</label>
                                        <select style={input} value={data.category} onChange={e => setData('category', e.target.value)}>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        {errors.category && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.category}</p>}
                                    </div>
                                    <div>
                                        <label style={{ color: '#ffffff66', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem' }}>Plafond mensuel (€)</label>
                                        <input
                                            style={input}
                                            type="number"
                                            step="0.01"
                                            value={data.limit_amount}
                                            onChange={e => setData('limit_amount', e.target.value)}
                                            placeholder="Ex: 300"
                                        />
                                        {errors.limit_amount && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.limit_amount}</p>}
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

                    {/* Liste des budgets */}
                    {budgets.length === 0 ? (
                        <div style={card}>
                            <p style={{ color: '#ffffff44', textAlign: 'center', fontSize: '0.9rem' }}>
                                Aucun budget défini. Clique sur "+ Nouveau budget" pour commencer.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                            {budgets.map(b => (
                                <div key={b.id} style={card}>

                                    {/* En-tête carte */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <h3 style={{ color: '#c9a84c', fontWeight: '600', fontSize: '1rem' }}>{b.category}</h3>
                                        <button
                                            onClick={() => supprimer(b.id)}
                                            style={{ background: 'none', border: 'none', color: '#f8717166', cursor: 'pointer', fontSize: '1rem' }}
                                        >
                                            🗑
                                        </button>
                                    </div>

                                    {/* Montants */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <span style={{ color: b.percent >= 100 ? '#f87171' : b.percent >= 75 ? '#facc15' : '#ffffff', fontSize: '1.4rem', fontWeight: 'bold' }}>
                                            {Number(b.spent).toFixed(2)} €
                                        </span>
                                        <span style={{ color: '#ffffff44', fontSize: '0.85rem' }}>
                                            / {Number(b.limit_amount).toFixed(2)} €
                                        </span>
                                    </div>

                                    {/* Barre de progression */}
                                    <BarreProgression percent={b.percent} />

                                    {/* Pourcentage + statut */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                        <span style={{ color: '#ffffff44', fontSize: '0.75rem' }}>{b.percent}% utilisé</span>
                                        {b.percent >= 100 && (
                                            <span style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: '600' }}>⚠ Dépassé</span>
                                        )}
                                        {b.percent >= 75 && b.percent < 100 && (
                                            <span style={{ color: '#facc15', fontSize: '0.75rem', fontWeight: '600' }}>⚡ Attention</span>
                                        )}
                                        {b.percent < 75 && (
                                            <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: '600' }}>✓ OK</span>
                                        )}
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