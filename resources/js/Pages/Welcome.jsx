import { Head, Link } from '@inertiajs/react';

const C = {
    bg: '#0a0e1a',
    card: '#141929',
    border: '#1e2a4a',
    gold: '#d4af37',
    text: '#e8eef7',
    textDim: '#8b9bb8',
    blue: '#3b82f6',
};

export default function Welcome({ canLogin, canRegister }) {
    return (
        <>
            <Head title="My Wise Money" />

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 20px ${C.gold}33; }
                    50%      { box-shadow: 0 0 40px ${C.gold}66; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-8px); }
                }
                .fade-1 { animation: fadeUp 0.8s ease 0.1s both; }
                .fade-2 { animation: fadeUp 0.8s ease 0.3s both; }
                .fade-3 { animation: fadeUp 0.8s ease 0.5s both; }
                .fade-4 { animation: fadeUp 0.8s ease 0.7s both; }
                .fade-5 { animation: fadeUp 0.8s ease 0.9s both; }
                .glow   { animation: glow 3s ease-in-out infinite; }
                .float  { animation: float 4s ease-in-out infinite; }
                .feature-card:hover { transform: translateY(-4px); border-color: ${C.gold}66; }
            `}</style>

            <div style={{
                background: `radial-gradient(ellipse at top, #1a2138 0%, ${C.bg} 60%)`,
                minHeight: '100vh',
                color: C.text,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                position: 'relative',
                overflow: 'hidden',
            }}>

                {/* Cercles d'ambiance */}
                <div style={{
                    position: 'absolute',
                    top: '-200px', right: '-200px',
                    width: '500px', height: '500px',
                    background: `radial-gradient(circle, ${C.gold}22 0%, transparent 70%)`,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-200px', left: '-200px',
                    width: '500px', height: '500px',
                    background: `radial-gradient(circle, ${C.blue}22 0%, transparent 70%)`,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }} />

                {/* Header */}
                <nav style={{
                    padding: '1.5rem 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 10,
                }}>
                    <img src="/images/logo.png" alt="My Wise Money" style={{ height: '48px', filter: `drop-shadow(0 0 16px ${C.gold}44)` }} />

                    {canLogin && (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Link href="/login" style={{
                                color: C.gold,
                                textDecoration: 'none',
                                padding: '0.5rem 1.2rem',
                                border: `1px solid ${C.gold}66`,
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                            }}>
                                Connexion
                            </Link>
                            {canRegister && (
                                <Link href="/register" style={{
                                    background: `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`,
                                    color: '#0a0e1a',
                                    textDecoration: 'none',
                                    padding: '0.55rem 1.3rem',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    boxShadow: `0 4px 12px ${C.gold}44`,
                                }}>
                                    Créer un compte
                                </Link>
                            )}
                        </div>
                    )}
                </nav>

                {/* Hero */}
                <section style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    padding: '3rem 2rem 3rem',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 10,
                }}>
                    <div className="fade-1 float" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <img src="/images/logo.png" alt="My Wise Money" style={{ height: '180px', filter: `drop-shadow(0 0 40px ${C.gold}66)` }} />
                    </div>

                    <p className="fade-2" style={{
                        color: C.gold,
                        fontSize: '0.85rem',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        marginBottom: '1.5rem',
                    }}>
                        Intelligence financière personnelle
                    </p>

                    <h2 className="fade-3" style={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        lineHeight: 1.15,
                        marginBottom: '1.5rem',
                        background: `linear-gradient(135deg, ${C.text} 0%, ${C.gold} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        Reprenez le contrôle <br/> de votre budget
                    </h2>

                    <p className="fade-4" style={{
                        color: C.textDim,
                        fontSize: '1.1rem',
                        maxWidth: '600px',
                        margin: '0 auto 2.5rem',
                        lineHeight: 1.6,
                    }}>
                        Suivez vos dépenses, fixez des plafonds, recevez des conseils
                        personnalisés grâce à une IA qui comprend votre situation financière.
                    </p>

                    {canRegister && (
                        <div className="fade-5" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/register" className="glow" style={{
                                background: `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`,
                                color: '#0a0e1a',
                                textDecoration: 'none',
                                padding: '0.9rem 2rem',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                display: 'inline-block',
                            }}>
                                Commencer gratuitement →
                            </Link>
                            <Link href="/login" style={{
                                background: 'transparent',
                                color: C.text,
                                textDecoration: 'none',
                                padding: '0.9rem 2rem',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: '500',
                                border: `1px solid ${C.border}`,
                                display: 'inline-block',
                            }}>
                                J'ai déjà un compte
                            </Link>
                        </div>
                    )}
                </section>

                {/* Fonctionnalités */}
                <section style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    padding: '3rem 2rem',
                    position: 'relative',
                    zIndex: 10,
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '1.25rem',
                    }}>
                        {[
                            { icon: '📊', title: 'Tableau de bord',     desc: 'Visualisez vos revenus, dépenses et solde en un coup d\'œil.' },
                            { icon: '🎯', title: 'Budgets intelligents', desc: 'Fixez des plafonds par catégorie et soyez alerté avant de dépasser.' },
                            { icon: '🤖', title: 'Assistant IA',         desc: 'Posez vos questions à un chatbot qui connaît votre situation.' },
                            { icon: '💸', title: 'Transferts',           desc: 'Envoyez ou demandez de l\'argent entre utilisateurs en un clic.' },
                            { icon: '🌍', title: '10 langues',           desc: 'Disponible en français, anglais, espagnol, arabe, chinois et plus.' },
                            { icon: '💱', title: '12 devises',           desc: 'EUR, USD, GBP, JPY, CHF, XAF... gérez vos finances en multi-devises.' },
                        ].map((f, i) => (
                            <div key={i} className="feature-card" style={{
                                background: `linear-gradient(135deg, ${C.card} 0%, #0f1424 100%)`,
                                border: `1px solid ${C.border}`,
                                borderRadius: '14px',
                                padding: '1.5rem',
                                transition: 'all 0.3s ease',
                                cursor: 'default',
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                                <h3 style={{
                                    color: C.gold,
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    letterSpacing: '0.03em',
                                }}>
                                    {f.title}
                                </h3>
                                <p style={{
                                    color: C.textDim,
                                    fontSize: '0.85rem',
                                    lineHeight: 1.5,
                                }}>
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA finale */}
                {canRegister && (
                    <section style={{
                        maxWidth: '800px',
                        margin: '2rem auto',
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 10,
                    }}>
                        <div style={{
                            background: `linear-gradient(135deg, ${C.card} 0%, #1a2138 100%)`,
                            border: `1px solid ${C.gold}44`,
                            borderRadius: '20px',
                            padding: '3rem 2rem',
                            boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
                        }}>
                            <h3 style={{
                                color: C.gold,
                                fontSize: '1.8rem',
                                fontWeight: 'bold',
                                marginBottom: '1rem',
                            }}>
                                Prêt à reprendre le contrôle ?
                            </h3>
                            <p style={{
                                color: C.textDim,
                                fontSize: '1rem',
                                marginBottom: '2rem',
                                maxWidth: '500px',
                                margin: '0 auto 2rem',
                            }}>
                                Inscription gratuite, sans carte bancaire. Compte créé en 30 secondes.
                            </p>
                            <Link href="/register" style={{
                                background: `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`,
                                color: '#0a0e1a',
                                textDecoration: 'none',
                                padding: '0.9rem 2.2rem',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                display: 'inline-block',
                                boxShadow: `0 4px 16px ${C.gold}44`,
                            }}>
                                Créer mon compte gratuitement
                            </Link>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer style={{
                    borderTop: `1px solid ${C.border}`,
                    padding: '2rem',
                    textAlign: 'center',
                    color: C.textDim,
                    fontSize: '0.8rem',
                    position: 'relative',
                    zIndex: 10,
                }}>
                    <p>© 2025 My Wise Money — Projet étudiant en finance et intelligence artificielle</p>
                </footer>

            </div>
        </>
    );
}