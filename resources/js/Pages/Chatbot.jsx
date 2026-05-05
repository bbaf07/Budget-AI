import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

const card = {
    background: '#1a1a1a',
    border: '1px solid #c9a84c44',
    borderRadius: '12px',
    padding: '1.5rem',
};

const inputStyle = {
    background: '#111',
    border: '1px solid #c9a84c44',
    borderRadius: '8px',
    color: '#ffffff',
    padding: '0.6rem 1rem',
    outline: 'none',
    flex: 1,
    fontSize: '0.95rem',
};

function Message({ msg }) {
    const isUser = msg.role === 'user';
    return (
        <div style={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            marginBottom: '1rem',
        }}>
            {/* Avatar bot */}
            {!isUser && (
                <div style={{
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    background: '#c9a84c22',
                    border: '1px solid #c9a84c44',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', marginRight: '0.6rem', flexShrink: 0,
                }}>
                    🤖
                </div>
            )}

            {/* Bulle */}
            <div style={{
                maxWidth: '70%',
                background: isUser ? '#c9a84c' : '#2a2a2a',
                color: isUser ? '#0f0f0f' : '#ffffff',
                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                border: isUser ? 'none' : '1px solid #c9a84c22',
            }}>
                {msg.content}
            </div>

            {/* Avatar user */}
            {isUser && (
                <div style={{
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    background: '#c9a84c',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', marginLeft: '0.6rem', flexShrink: 0,
                    color: '#0f0f0f', fontWeight: 'bold',
                }}>
                    U
                </div>
            )}
        </div>
    );
}

function TypingIndicator() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#c9a84c22', border: '1px solid #c9a84c44',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
            }}>
                🤖
            </div>
            <div style={{
                background: '#2a2a2a', border: '1px solid #c9a84c22',
                borderRadius: '16px 16px 16px 4px', padding: '0.75rem 1rem',
                display: 'flex', gap: '4px', alignItems: 'center',
            }}>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: '#c9a84c',
                        animation: 'bounce 1.2s infinite',
                        animationDelay: `${i * 0.2}s`,
                    }} />
                ))}
            </div>
        </div>
    );
}

const suggestions = [
    "Où est-ce que je dépense le plus ce mois-ci ?",
    "Comment réduire mes dépenses alimentaires ?",
    "Résume ma situation financière du mois.",
    "Suis-je en train de dépasser mon budget ?",
];

export default function Chatbot() {
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: "Bonjour ! Je suis ton assistant budgétaire. Pose-moi des questions sur tes dépenses, tes revenus ou ton budget — je suis là pour t'aider. 💰",
        }
    ]);
    const [input, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    async function envoyer(texte) {
        const message = texte || input.trim();
        if (!message) return;

        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', content: message }]);
        setLoading(true);

        try {
            const res = await fetch('/chatbot/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1]
                        ? decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)[1])
                        : document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({ message }),
            });

            const data = await res.json();
            setMessages(prev => [...prev, {
                role: 'bot',
                content: data.reply || "Désolé, je n'ai pas pu répondre.",
            }]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: "Une erreur s'est produite. Vérifie ta connexion.",
            }]);
        } finally {
            setLoading(false);
        }
    }

    function handleKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            envoyer();
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="Chatbot" />

            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-6px); }
                }
            `}</style>

            <div style={{ background: '#0f0f0f', minHeight: '100vh', padding: '2rem 1rem' }}>
                <div style={{ maxWidth: '760px', margin: '0 auto' }}>

                    {/* Titre */}
                    <h1 style={{ color: '#c9a84c', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                        Assistant Budgétaire IA
                    </h1>

                    {/* Zone de chat */}
                    <div style={{ ...card, marginBottom: '1rem' }}>
                        <div style={{
                            height: '420px',
                            overflowY: 'auto',
                            paddingRight: '0.5rem',
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#c9a84c33 transparent',
                        }}>
                            {messages.map((msg, i) => (
                                <Message key={i} msg={msg} />
                            ))}
                            {loading && <TypingIndicator />}
                            <div ref={bottomRef} />
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => envoyer(s)}
                                disabled={loading}
                                style={{
                                    background: '#1a1a1a',
                                    border: '1px solid #c9a84c33',
                                    borderRadius: '20px',
                                    color: '#c9a84c88',
                                    fontSize: '0.78rem',
                                    padding: '0.3rem 0.8rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Zone de saisie */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <input
                            style={inputStyle}
                            value={input}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Pose une question sur ton budget..."
                            disabled={loading}
                        />
                        <button
                            onClick={() => envoyer()}
                            disabled={loading || !input.trim()}
                            style={{
                                background: input.trim() && !loading ? '#c9a84c' : '#c9a84c44',
                                color: '#0f0f0f',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.6rem 1.2rem',
                                fontWeight: 'bold',
                                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            Envoyer ➤
                        </button>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}