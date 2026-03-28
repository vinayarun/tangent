import { ConversationManager } from '../packages/conversation-engine/src';
import { GraphStore, GraphExtractor } from '../packages/knowledge-graph/src';
import { FileSystemAdapter } from '../packages/persistence/src';
import { EventType } from '../packages/shared-types/src';
import * as path from 'path';

async function main() {
    console.log('🧪 Starting Knowledge Graph Verification...');

    const dataDir = path.join(__dirname, '../data_test_graph');
    // Ensure clean state
    const fs = require('fs');
    if (fs.existsSync(dataDir)) {
        fs.rmSync(dataDir, { recursive: true, force: true });
    }

    const sessionStore = new FileSystemAdapter(path.join(dataDir, 'sessions'));
    const nodeStore = new FileSystemAdapter(path.join(dataDir, 'nodes'));
    const entityStore = new FileSystemAdapter(path.join(dataDir, 'entities'));
    const relationStore = new FileSystemAdapter(path.join(dataDir, 'relations'));

    // 1. Setup Engines
    const conversationManager = new ConversationManager(undefined, sessionStore, nodeStore);
    const graphStore = new GraphStore(undefined, entityStore, relationStore);
    const extractor = new GraphExtractor(graphStore); // Subscribes to bus automatically

    // 2. Create Session
    const session = await conversationManager.createSession('Graph Test');

    // 3. Inject Content with Entities
    console.log('3. Injecting content with [[Entities]]...');
    await conversationManager.addMessage(session.id, 'user', 'I am studying [[Quantum Physics]] and [[General Relativity]].');

    // Allow event loop to process
    await new Promise(resolve => setTimeout(resolve, 100));

    // 4. Verify entities in GraphStore
    console.log('4. Verifying GraphStore state...');
    const snapshot = graphStore.getSnapshot();
    console.log('   Stats:', snapshot.entities.length, 'entities');

    const quantum = snapshot.entities.find(e => e.label === 'Quantum Physics');
    const relativity = snapshot.entities.find(e => e.label === 'General Relativity');

    if (quantum && relativity) {
        console.log('   ✅ Entities found in memory.');
    } else {
        console.error('   ❌ Entities NOT found in memory.');
    }

    // 5. Verify Persistence
    console.log('5. Verifying Persistence...');
    // Create new store instance to simulate reload
    const newGraphStore = new GraphStore(undefined, entityStore, relationStore);

    // We need to manually load or check storage content since loadEntity is by ID.
    // Let's check the file system directly via getAllKeys
    const keys = await entityStore.getAllKeys();
    console.log('   Persisted Keys:', keys.length);

    if (keys.length >= 2) {
        console.log('   ✅ Entities persisted to disk.');
    } else {
        console.error('   ❌ Entities NOT persisted.');
    }

    console.log('🎉 Verification Complete!');
}

main().catch(console.error);
