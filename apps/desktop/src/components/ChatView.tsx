import { useState, useEffect, useRef } from 'react';
import { ConversationManager } from '@tangent/conversation-engine';
import { ConversationNode, ConversationSession, EventType } from '@tangent/shared-types';
import { services } from '../services';

interface ChatViewProps {
    manager: ConversationManager;
}

export function ChatView({ manager }: ChatViewProps) {
    const [session, setSession] = useState<ConversationSession | null>(null);
    const [nodes, setNodes] = useState<ConversationNode[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Session
    useEffect(() => {
        const initSession = async () => {
            const storedSessionId = localStorage.getItem('tangent:latest_session');
            if (storedSessionId) {
                const s = await manager.getSession(storedSessionId) || await manager.loadSession(storedSessionId);
                if (s) {
                    setSession(s);
                    return;
                }
            }

            const newSession = await manager.createSession('New Chat');
            setSession(newSession);
            localStorage.setItem('tangent:latest_session', newSession.id);
        };
        initSession();
    }, [manager]);

    // Subscribe to Events
    useEffect(() => {
        const handleNodeAdded = (payload: { node: ConversationNode }) => {
            if (session && payload.node.sessionId === session.id) {
                setNodes(prev => [...prev, payload.node]);
                scrollToBottom();
            }
        };

        services.bus.on(EventType.NODE_ADDED, handleNodeAdded as any);
        return () => {
            // services.bus.off(...)
        };
    }, [session]);

    // Load History
    useEffect(() => {
        if (!session) return;
        const loadHistory = async () => {
            const latestNodeId = localStorage.getItem(`tangent:session:${session.id}:latest`);
            if (latestNodeId) {
                const history = await manager.getHistory(latestNodeId);
                setNodes(history);
            } else {
                setNodes([]);
            }
        };
        loadHistory();
    }, [session, manager]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async () => {
        if (!input.trim() || !session) return;

        setIsLoading(true);
        const content = input;
        setInput('');

        const parentId = nodes.length > 0 ? nodes[nodes.length - 1].id : null;
        const userNode = await manager.addMessage(session.id, 'user', content, parentId);
        localStorage.setItem(`tangent:session:${session.id}:latest`, userNode.id);

        if (!services.llm) {
            setTimeout(async () => {
                const aiNode = await manager.addMessage(session.id, 'assistant', `AI not configured. Please add your Gemini Key in Settings.`, userNode.id);
                localStorage.setItem(`tangent:session:${session.id}:latest`, aiNode.id);
                setIsLoading(false);
            }, 500);
            return;
        }

        try {
            const history = nodes.map(n => ({
                role: n.role === 'user' ? 'user' : 'model',
                parts: [n.content]
            }));

            const response = await services.llm.generateContent({
                prompt: content,
                history: history as any
            });

            const aiNode = await manager.addMessage(session.id, 'assistant', response.text, userNode.id);
            localStorage.setItem(`tangent:session:${session.id}:latest`, aiNode.id);

        } catch (error) {
            console.error('LLM Error', error);
            // More descriptive error
            const msg = error instanceof Error ? error.message : 'Unknown error';
            await manager.addMessage(session.id, 'assistant', `Error: ${msg}`, userNode.id);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1rem', boxSizing: 'border-box' }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', border: '1px solid #333', borderRadius: '4px', padding: '1rem', backgroundColor: '#1e1e1e' }}>
                {nodes.length === 0 && <div style={{ color: '#888' }}>Start a conversation...</div>}

                {nodes.map(node => (
                    <div key={node.id} style={{
                        marginBottom: '0.8rem',
                        alignSelf: node.role === 'user' ? 'flex-end' : 'flex-start',
                        backgroundColor: node.role === 'user' ? '#0d47a1' : '#333',
                        color: '#fff',
                        padding: '0.8rem',
                        borderRadius: '8px',
                        maxWidth: '80%',
                        wordWrap: 'break-word'
                    }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.2rem' }}>{node.role}</div>
                        {node.content}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', paddingBottom: '1rem' }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        padding: '0.8rem',
                        borderRadius: '4px',
                        border: '1px solid #555',
                        backgroundColor: '#2d2d2d',
                        color: '#eee',
                        fontSize: '1rem'
                    }}
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !input}
                    style={{
                        padding: '0 1.5rem',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        opacity: isLoading ? 0.7 : 1
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
