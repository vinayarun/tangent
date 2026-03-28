import { useState, useEffect } from 'react';
import './App.css';
import { services } from './services';
import { GraphView } from './components/GraphView';
import { ChatView } from './components/ChatView';
import { SettingsView } from './components/SettingsView';

function App() {
  const [activeView, setActiveView] = useState<'graph' | 'chat' | 'settings'>('chat');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize services
    services.init().then(() => {
      setIsReady(true);
      console.log('Tangent Services Ready');
    });
  }, []);

  if (!isReady) return <div>Loading Tangent...</div>;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Tangent</h1>
        <nav>
          <button onClick={() => setActiveView('chat')}>Chat</button>
          <button onClick={() => setActiveView('graph')}>Graph</button>
          <button onClick={() => setActiveView('settings')}>Settings</button>
        </nav>
      </header>
      <main className="app-main">
        <aside className="app-sidebar">
          {/* Sidebar content */}
          <h2>History</h2>
        </aside>
        <section className="app-content">
          {activeView === 'graph' && <GraphView store={services.graph} />}
          {activeView === 'chat' && <ChatView manager={services.conversation} />}
          {activeView === 'settings' && <SettingsView />}
        </section>
      </main>
    </div>
  );
}

export default App;
