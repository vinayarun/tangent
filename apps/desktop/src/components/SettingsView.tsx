import { useState, useEffect } from 'react';
import { services } from '../services';

export function SettingsView() {
    // MVP: Just API Key management
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState<'saved' | 'idle'>('idle');

    useEffect(() => {
        // Load initial key
        const load = async () => {
            const current = await services.getApiKey();
            if (current) setApiKey(current);
        };
        load();
    }, []);

    const handleSave = async () => {
        await services.setApiKey(apiKey);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Settings</h2>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                <h3>AI Configuration</h3>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Google Gemini API Key
                    </label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIza..."
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                        Get your key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer">Google AI Studio</a>.
                        Stored locally in your browser/device.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {status === 'saved' ? 'Saved!' : 'Save Key'}
                </button>
            </div>
        </div>
    );
}

