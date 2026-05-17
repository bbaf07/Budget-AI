import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { formatMoney, getCurrencySymbol } from '@/lib/i18n';

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

export default function AdminDashboard({ users, stats }) {
    const { props } = usePage();
    const currency = props.auth?.user?.currency || 'EUR';

    function toggleRole(id) {
        router.post(`/admin/users/${id}/toggle-role`);
    }

    function supprimerUser(id) {
        if (confirm('Supprimer cet utilisateur et toutes ses données ?')) {
            router.delete(`/admin/users/${id}`);
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="Administration" />

            <div style={{ background: C.bg, minHeight: '100vh', padding: '2rem 1rem' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h1 style={{ color: C.gold, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                            Administration
                        </h1>
                        <p style={{ color: C.textDim, fontSize: '0.85rem', marginTop: '0.3rem' }}>
                            Vue d'ensemble des utilisateurs et statistiques globales
                        </p>
                    </div>

                    {/* Stats globales */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                        {[
                            { label: 'Utilisateurs',      value: stats.total_users,                                  color: C.gold },
                            { label: 'Nouveaux ce mois',  value: stats.nouveaux_ce_mois,                            color: C.blue },
                            { label: 'Transactions',       value: stats.total_transactions,                          color: C.gold },
                            { label: 'Total revenus',      value: formatMoney(stats.total_revenus, currency),        color: '#4ade80' },
                            { label: 'Total dépenses',     value: formatMoney(stats.total_depenses, currency),       color: '#f87171' },
                        ].map(s => (
                            <div key={s.label} style={card}>
                                <p style={{ color: C.textDim, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                                    {s.label}
                                </p>
                                <p style={{ color: s.color, fontSize: '1.3rem', fontWeight: 'bold' }}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Liste utilisateurs */}
                    <div style={card}>
                        <h2 style={{ color: C.gold, fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                            Utilisateurs ({users.length})
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1.5fr', gap: '0.5rem', padding: '0.5rem 0', borderBottom: `1px solid ${C.gold}33`, marginBottom: '0.5rem' }}>
                            {['Nom', 'Email', 'Rôle', 'Inscrit', 'Transactions', 'Actions'].map(h => (
                                <span key={h} style={{ color: C.gold, fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>{h}</span>
                            ))}
                        </div>

                        {users.map(u => (
                            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1.5fr', gap: '0.5rem', padding: '0.75rem 0', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
                                <span style={{ color: C.text, fontSize: '0.85rem' }}>{u.name}</span>
                                <span style={{ color: C.textDim, fontSize: '0.85rem' }}>{u.email}</span>
                                <span style={{
                                    color: u.role === 'admin' ? C.gold : C.textDim,
                                    fontSize: '0.8rem',
                                    fontWeight: u.role === 'admin' ? '600' : '400',
                                }}>
                                    {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                                </span>
                                <span style={{ color: C.textDim, fontSize: '0.8rem' }}>{u.created_at}</span>
                                <span style={{ color: C.text, fontSize: '0.85rem', fontWeight: '600' }}>{u.transactions_count}</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => toggleRole(u.id)}
                                        style={{
                                            background: `${C.gold}22`,
                                            border: `1px solid ${C.gold}66`,
                                            color: C.gold,
                                            borderRadius: '6px',
                                            padding: '0.25rem 0.6rem',
                                            fontSize: '0.7rem',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                        }}>
                                        {u.role === 'admin' ? '→ User' : '→ Admin'}
                                    </button>
                                    <button onClick={() => supprimerUser(u.id)}
                                        style={{ background: 'none', border: 'none', color: '#f8717166', cursor: 'pointer', fontSize: '1rem' }}>
                                        🗑
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}