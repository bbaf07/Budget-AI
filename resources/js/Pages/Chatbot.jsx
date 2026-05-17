import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { t } from '@/lib/i18n';

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

const inputStyle = {
    background: '#0a0e1a',
    border: `1px solid ${C.border}`,
    borderRadius: '10px',
    color: C.text,
    padding: '0.7rem 1rem',
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
            {!isUser && (
                <div style={{
                    width: '34px', height: '34px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${C.blue}44 0%, ${C.gold}44 100%)`,
                    border: `1px solid ${C.gold}66`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', marginRight: '0.6rem', flexShrink: 0,
                    boxShadow: `0 0 12px ${C.gold}33`,
                }}>
                    🤖
                </div>
            )}
            <div style={{
                maxWidth: '75%',
                background: isUser
                    ? `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`
                    : `linear-gradient(135deg, #1a2138 0%, #141929 100%)`,
                color: isUser ? '#0a0e1a' : C.text,
                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '0.8rem 1.1rem',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                border: isUser ? 'none' : `1px solid ${C.border}`,
                whiteSpace: 'pre-wrap',
                boxShadow: isUser
                    ? `0 4px 12px ${C.gold}33`
                    : '0 2px 8px rgba(0,0,0,0.3)',
            }}>
                {msg.content}
            </div>
            {isUser && (
                <div style={{
                    width: '34px', height: '34px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', marginLeft: '0.6rem', flexShrink: 0,
                    color: '#0a0e1a', fontWeight: 'bold',
                    boxShadow: `0 0 12px ${C.gold}44`,
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
                width: '34px', height: '34px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${C.blue}44 0%, ${C.gold}44 100%)`,
                border: `1px solid ${C.gold}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
            }}>
                🤖
            </div>
            <div style={{
                background: '#141929', border: `1px solid ${C.border}`,
                borderRadius: '16px 16px 16px 4px', padding: '0.75rem 1rem',
                display: 'flex', gap: '4px', alignItems: 'center',
            }}>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: C.gold,
                        animation: 'bounce 1.2s infinite',
                        animationDelay: `${i * 0.2}s`,
                    }} />
                ))}
            </div>
        </div>
    );
}

const suggestionsByLocale = {
    fr: ['Où est-ce que je dépense le plus ?', 'Comment réduire mes dépenses ?', 'Résume ma situation du mois.', 'Suis-je en train de dépasser mon budget ?'],
    en: ['Where do I spend the most?', 'How can I reduce my expenses?', 'Summarize my month.', 'Am I exceeding my budget?'],
    es: ['¿Dónde gasto más?', '¿Cómo reducir mis gastos?', 'Resumen del mes.', '¿Excedo mi presupuesto?'],
    de: ['Wo gebe ich am meisten aus?', 'Wie reduziere ich meine Ausgaben?', 'Monatszusammenfassung.', 'Überschreite ich mein Budget?'],
    it: ['Dove spendo di più?', 'Come ridurre le spese?', 'Riassunto del mese.', 'Sto superando il budget?'],
    pt: ['Onde gasto mais?', 'Como reduzir gastos?', 'Resumo do mês.', 'Estou estourando o orçamento?'],
    ar: ['أين أنفق أكثر؟', 'كيف أقلل مصاريفي؟', 'لخص شهري.', 'هل أتجاوز ميزانيتي؟'],
    zh: ['我在哪里花费最多？', '如何减少开支？', '总结本月。', '我是否超支了？'],
    hi: ['मैं सबसे ज़्यादा कहाँ खर्च करता हूँ?', 'खर्च कैसे कम करें?', 'इस महीने का सारांश।', 'क्या मैं बजट से ज़्यादा खर्च कर रहा हूँ?'],
    ru: ['Где я трачу больше всего?', 'Как сократить расходы?', 'Итоги месяца.', 'Превышаю ли я бюджет?'],
};

const greetingByLocale = {
    fr: 'Bonjour ! Je suis ton assistant budgétaire. Pose-moi des questions sur tes dépenses, tes revenus ou ton budget — je suis là pour t\'aider.',
    en: 'Hello! I\'m your budget assistant. Ask me about your expenses, income or budget — I\'m here to help.',
    es: '¡Hola! Soy tu asistente presupuestario. Pregúntame sobre tus gastos, ingresos o presupuesto.',
    de: 'Hallo! Ich bin dein Budget-Assistent. Frag mich zu deinen Ausgaben oder deinem Budget.',
    it: 'Ciao! Sono il tuo assistente di budget. Chiedimi delle tue spese o del tuo budget.',
    pt: 'Olá! Sou seu assistente de orçamento. Pergunte-me sobre seus gastos ou orçamento.',
    ar: 'مرحباً! أنا مساعدك المالي. اسألني عن مصاريفك أو ميزانيتك.',
    zh: '你好！我是你的预算助手。请问关于支出、收入或预算的任何问题。',
    hi: 'नमस्ते! मैं आपका बजट सहायक हूँ। मुझसे अपने खर्च या बजट के बारे में पूछें।',
    ru: 'Привет! Я твой бюджетный помощник. Спроси меня о расходах или бюджете.',
};

const placeholderByLocale = {
    fr: 'Pose une question sur ton budget...',
    en: 'Ask a question about your budget...',
    es: 'Haz una pregunta sobre tu presupuesto...',
    de: 'Stelle eine Frage zu deinem Budget...',
    it: 'Fai una domanda sul tuo budget...',
    pt: 'Faça uma pergunta sobre seu orçamento...',
    ar: 'اطرح سؤالاً عن ميزانيتك...',
    zh: '问一个关于预算的问题...',
    hi: 'अपने बजट के बारे में सवाल पूछें...',
    ru: 'Задай вопрос о бюджете...',
};

export default function Chatbot() {
    const { props } = usePage();
    const locale = props.auth?.user?.locale || 'fr';
    const suggestions = suggestionsByLocale[locale] || suggestionsByLocale.fr;
    const placeholder = placeholderByLocale[locale] || placeholderByLocale.fr;

    const [messages, setMessages] = useState([
        { role: 'bot', content: greetingByLocale[locale] || greetingByLocale.fr }
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
            const xsrfToken = decodeURIComponent(
                document.cookie.split('; ').find(r => r.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
            );

            const res = await fetch('/chatbot/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': xsrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ message, locale }),
            });

            if (!res.ok) throw new Error(`Erreur ${res.status}`);

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'bot', content: data.reply || '—' }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'bot', content: 'Erreur : ' + e.message }]);
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
            <Head title={t(locale, 'chatbot')} />
            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-6px); }
                }
            `}</style>
            <div style={{ background: C.bg, minHeight: '100vh', padding: '2rem 1rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                    <h1 style={{ color: C.gold, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                        {t(locale, 'chatbot')}
                    </h1>

                    <div style={{ ...card, marginBottom: '1rem' }}>
                        <div style={{
                            height: '440px',
                            overflowY: 'auto',
                            paddingRight: '0.5rem',
                            scrollbarWidth: 'thin',
                            scrollbarColor: `${C.gold}33 transparent`,
                        }}>
                            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
                            {loading && <TypingIndicator />}
                            <div ref={bottomRef} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        {suggestions.map((s, i) => (
                            <button key={i} onClick={() => envoyer(s)} disabled={loading}
                                style={{
                                    background: C.card,
                                    border: `1px solid ${C.gold}44`,
                                    borderRadius: '20px',
                                    color: C.gold,
                                    fontSize: '0.78rem',
                                    padding: '0.35rem 0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}>
                                {s}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <input
                            style={inputStyle}
                            value={input}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder={placeholder}
                            disabled={loading}
                        />
                        <button onClick={() => envoyer()} disabled={loading || !input.trim()}
                            style={{
                                background: input.trim() && !loading
                                    ? `linear-gradient(135deg, ${C.gold} 0%, #b8941f 100%)`
                                    : C.border,
                                color: input.trim() && !loading ? '#0a0e1a' : C.textDim,
                                border: 'none',
                                borderRadius: '10px',
                                padding: '0.7rem 1.3rem',
                                fontWeight: 'bold',
                                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s',
                                boxShadow: input.trim() && !loading ? `0 4px 12px ${C.gold}44` : 'none',
                            }}>
                            ➤
                        </button>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}