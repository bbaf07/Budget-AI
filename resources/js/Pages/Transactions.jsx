import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';


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

function ImportCsv() {
    const { data, setData, post, processing, reset } = useForm({ csv_file: null });
    const [message, setMessage] = useState('');
    const fileRef = useRef(null);

    function handleFile(e) {
        setData('csv_file', e.target.files[0]);
    }

    function submit(e) {
    e.preventDefault();
    if (!data.csv_file) return;

    const formData = new FormData();
    formData.append('csv_file', data.csv_file);

    fetch('/transactions/import', {
        method: 'POST',
        headers: {
            'X-XSRF-TOKEN': decodeURIComponent(
                document.cookie.split('; ').find(r => r.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
            ),
        },
        body: formData,
    }).then(res => {
        if (res.ok || res.redirected) {
            setMessage('✅ Import réussi ! Recharge la page pour voir les transactions.');
            if (fileRef.current) fileRef.current.value = '';
            setData('csv_file', null);
            // Recharge la page après 1.5 secondes
            setTimeout(() => window.location.reload(), 1500);
        } else {
            res.text().then(text => console.log(text));
            setMessage('❌ Erreur lors de l\'import.');
        }
    }).catch(() => {
        setMessage('❌ Erreur réseau.');
    });
}

    return (
        <div style={{ ...card, marginBottom: '1rem' }}>
            <h2 style={{ color: '#c9a84c', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                📂 Importer un fichier CSV
            </h2>
            <p style={{ color: '#ffffff66', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                Format attendu : <span style={{ color: '#c9a84c88' }}>date, libellé, montant, type (income/expense), catégorie</span>
            </p>
            <form onSubmit={submit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFile}
                    style={{ color: '#ffffff88', fontSize: '0.85rem', background: '#111', border: '1px solid #c9a84c33', borderRadius: '6px', padding: '0.4rem 0.6rem' }}
                />
                <button
                    type="submit"
                    disabled={!data.csv_file || processing}
                    style={{
                        background: data.csv_file && !processing ? '#c9a84c' : '#c9a84c44',
                        color: '#0f0f0f',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem 1.2rem',
                        fontWeight: 'bold',
                        cursor: data.csv_file && !processing ? 'pointer' : 'not-allowed',
                        fontSize: '0.85rem',
                    }}
                >
                    {processing ? 'Import...' : 'Importer'}
                </button>
            </form>
            {message && (
                <p style={{ color: message.startsWith('✅') ? '#4ade80' : '#f87171', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                    {message}
                </p>
            )}
        </div>
    );
}


export default function Transactions({ transactions }) {
    const [showForm, setShowForm] = useState(false);
    const [filtre, setFiltre] = useState('tous');

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

    const filtrees = transactions.filter(t =>
        filtre === 'tous' ? true : t.type === filtre
    );

    return (
        <AuthenticatedLayout>
            <Head title="Transactions" />

            <div style={{ background: '#0f0f0f', minHeight: '100vh', padding: '2rem 1rem' }}>
                <div style={{ maxWidth: '960px', margin: '0 auto' }}>

                    {/* Titre + bouton */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h1 style={{ color: '#c9a84c', fontSize: '1.4rem', fontWeight: 'bold' }}>
                            Transactions
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

                    {/* Import CSV */}
                    <ImportCsv />

                    {/* Filtres */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        {[['tous', 'Tout'], ['income', 'Revenus'], ['expense', 'Dépenses']].map(([val, label]) => (
                            <button
                                key={val}
                                onClick={() => setFiltre(val)}
                                style={{
                                    background: filtre === val ? '#c9a84c' : '#1a1a1a',
                                    color: filtre === val ? '#0f0f0f' : '#ffffff88',
                                    border: '1px solid #c9a84c44',
                                    borderRadius: '6px',
                                    padding: '0.3rem 0.9rem',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    fontWeight: filtre === val ? '600' : '400',
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Tableau */}
                    <div style={card}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 0.5fr', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid #c9a84c33', marginBottom: '0.5rem' }}>
                            {['Date', 'Libellé', 'Catégorie', 'Montant', ''].map(h => (
                                <span key={h} style={{ color: '#c9a84c', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>{h}</span>
                            ))}
                        </div>

                        {filtrees.length === 0 ? (
                            <p style={{ color: '#ffffff44', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
                                Aucune transaction.
                            </p>
                        ) : (
                            filtrees.map(t => (
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