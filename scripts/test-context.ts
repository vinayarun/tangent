import { ConversationManager } from '../packages/conversation-engine/src';
import { ContextManager, SummaryGenerator } from '../packages/ai-context/src';
import { FileSystemAdapter } from '../packages/persistence/src';
import * as path from 'path';

async function main() {
    console.log('🧪 Starting AI Context Verification...');

    const dataDir = path.join(__dirname, '../data_test_context');
    // Ensure clean state
    const fs = require('fs');
    if (fs.existsSync(dataDir)) {
        fs.rmSync(dataDir, { recursive: true, force: true });
    }

    const sessionStore = new FileSystemAdapter(path.join(dataDir, 'sessions'));
    const nodeStore = new FileSystemAdapter(path.join(dataDir, 'nodes'));
    const summaryStore = new FileSystemAdapter(path.join(dataDir, 'summaries'));

    // 1. Setup Engines
    const conversationManager = new ConversationManager(undefined, sessionStore, nodeStore);
    const summaryGenerator = new SummaryGenerator(summaryStore);
    const contextManager = new ContextManager(conversationManager);

    // 2. Create Session & Long Conversation
    const session = await conversationManager.createSession('Context Test');
    console.log('2. Helper: Creating long conversation...');

    let lastNodeId: string | null = null;
    const messages = [];

    // Create 15 messages (0-14)
    for (let i = 0; i < 15; i++) {
        const role = i % 2 === 0 ? 'user' : 'assistant';
        const node = await conversationManager.addMessage(session.id, role, `Message ${i} content that is somewhat long to simulate tokens.`, lastNodeId);
        lastNodeId = node.id;
        messages.push(node);
    }

    // 3. Verify Window Strategy
    console.log('3. Verifying Window Strategy (Limit 10)...');
    // We expect the last 10 messages
    const context = await contextManager.getContext(lastNodeId!, 100); // Token limit arg is mocked in WindowStrategy to just return last 10

    console.log(`   Retrieved ${context.length} messages.`);
    if (context.length === 10) {
        console.log('   ✅ Windowing correct (10 items).');
        if (context[context.length - 1].id === lastNodeId) {
            console.log('   ✅ Most recent message included.');
        } else {
            console.error('   ❌ Most recent message NOT included.');
        }
    } else {
        console.error(`   ❌ Windowing failed. Expected 10, got ${context.length}`);
    }

    // 4. Verify Summary Generation
    console.log('4. Verifying Summary Generation...');
    const nodeToSummarize = messages[0];
    const summary = await summaryGenerator.generateSummary(nodeToSummarize);

    console.log('   Summary Content:', summary.content);
    if (summary.content.includes('[Summary]')) {
        console.log('   ✅ Summary generated.');
    } else {
        console.error('   ❌ Summary generation failed.');
    }

    // 5. Verify Summary Persistence
    console.log('5. Verifying Summary Persistence...');
    const keys = await summaryStore.getAllKeys();
    if (keys.length > 0) {
        console.log('   ✅ Summary persisted.');
    } else {
        console.error('   ❌ Summary NOT persisted.');
    }

    console.log('🎉 Verification Complete!');
}

main().catch(console.error);
