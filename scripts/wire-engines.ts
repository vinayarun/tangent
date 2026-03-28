import { ConversationManager } from '../packages/conversation-engine/src';
import { GraphStore, GraphExtractor } from '../packages/knowledge-graph/src';
import { FileSystemAdapter } from '../packages/persistence/src';
import { EventBus } from '../packages/event-bus/src';
import { EventType } from '../packages/shared-types/src';
import * as path from 'path';

async function main() {
    console.log('🔗 Starting End-to-End Integration Verification...');

    const dataDir = path.join(__dirname, '../data_test_e2e');
    const fs = require('fs');
    if (fs.existsSync(dataDir)) {
        fs.rmSync(dataDir, { recursive: true, force: true });
    }

    // 1. Setup Shared Infrastructure
    const bus = new EventBus();

    // 2. Setup Persistence
    const sessionStore = new FileSystemAdapter(path.join(dataDir, 'sessions'));
    const nodeStore = new FileSystemAdapter(path.join(dataDir, 'nodes'));
    const entityStore = new FileSystemAdapter(path.join(dataDir, 'entities'));
    const relationStore = new FileSystemAdapter(path.join(dataDir, 'relations'));

    // 3. Initialize Engines with SHARED Bus
    console.log('3. Initializing Engines...');
    const conversationManager = new ConversationManager(bus, sessionStore, nodeStore);
    const graphStore = new GraphStore(bus, entityStore, relationStore);

    // Extractor is the "wiring" component that listens to bus and acts on store
    const extractor = new GraphExtractor(graphStore, bus);

    // 4. Trace Events for Debugging
    bus.on(EventType.NODE_ADDED, (payload) => console.log('   📨 Event: NODE_ADDED'));
    bus.on(EventType.ENTITY_CREATED, (payload: any) => console.log(`   📨 Event: ENTITY_CREATED -> ${payload.entity.label}`));

    // 5. Execute Flow
    console.log('5. Executing Chat Flow...');
    const session = await conversationManager.createSession('E2E Test');

    // This message contains a wikilink, which should trigger valid extraction
    await conversationManager.addMessage(session.id, 'user', 'I am interested in [[Cognitive Science]].');

    // Wait for async event processing
    await new Promise(resolve => setTimeout(resolve, 200));

    // 6. Verify Result in Graph Store
    console.log('6. Verifying Graph Integration...');
    const snapshot = graphStore.getSnapshot();
    const entity = snapshot.entities.find(e => e.label === 'Cognitive Science');

    if (entity) {
        console.log('   ✅ SUCCESS: Chat -> Event -> Extractor -> GraphStore works!');
    } else {
        console.error('   ❌ FAILURE: Entity not found in GraphStore.');
        process.exit(1);
    }
}

main().catch(console.error);
