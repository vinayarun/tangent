import { ConversationManager } from '../packages/conversation-engine/src';
import { FileSystemAdapter } from '../packages/persistence/src';
import { EventType } from '../packages/shared-types/src';
import * as path from 'path';

async function main() {
    console.log('🧪 Starting Conversation Engine Verification...');

    const dataDir = path.join(__dirname, '../data_test');
    const sessionStore = new FileSystemAdapter(path.join(dataDir, 'sessions'));
    const nodeStore = new FileSystemAdapter(path.join(dataDir, 'nodes'));

    const manager = new ConversationManager(undefined, sessionStore, nodeStore);

    // 1. Create Session
    console.log('1. Creating Session...');
    const session = await manager.createSession('Test Session');
    console.log('   ✅ Session Created:', session.id);

    // 2. Add Messages (Linear)
    console.log('2. Adding Linear Messages...');
    const userMsg = await manager.addMessage(session.id, 'user', 'Hello Tangent!');
    console.log('   ✅ User Message:', userMsg.id, userMsg.content);

    const aiMsg = await manager.addMessage(session.id, 'assistant', 'Hello! How can I help?', userMsg.id);
    console.log('   ✅ AI Message:', aiMsg.id, aiMsg.content);

    // 3. Verify Linear History
    console.log('3. Verifying Linear History...');
    const history = await manager.getHistory(aiMsg.id);
    if (history.length === 2 && history[0].id === userMsg.id && history[1].id === aiMsg.id) {
        console.log('   ✅ Linear History Correct');
    } else {
        console.error('   ❌ Linear History Failed:', history);
    }

    // 4. Create Branch
    console.log('4. Creating Branch...');
    // Branch from user message (ignoring AI response)
    const branch = manager.createBranch(userMsg.id, 'Alternative Path');
    console.log('   ✅ Branch Created:', branch.id, branch.branchName);

    // 5. Add Message to Branch
    // Note: addMessage takes parentId. To "add to branch" we just add to the branch's root node.
    const branchMsg = await manager.addMessage(session.id, 'assistant', 'Greetings! I am a different personality.', userMsg.id);
    console.log('   ✅ Branch Message:', branchMsg.id, branchMsg.content);

    // 6. Verify Branch History
    console.log('6. Verifying Branch History...');
    const branchHistory = await manager.getHistory(branchMsg.id);
    if (branchHistory.length === 2 && branchHistory[1].content.includes('different personality')) {
        console.log('   ✅ Branch History Correct');
    } else {
        console.error('   ❌ Branch History Failed:', branchHistory);
    }

    console.log('🎉 Verification Complete!');
}

main().catch(console.error);
