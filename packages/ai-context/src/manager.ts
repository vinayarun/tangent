import { ConversationNode } from '@tangent/shared-types';
import { ConversationManager } from '@tangent/conversation-engine';

export interface ContextStrategy {
    compress(nodes: ConversationNode[], tokenLimit: number): ConversationNode[];
}

export class WindowStrategy implements ContextStrategy {
    compress(nodes: ConversationNode[], tokenLimit: number): ConversationNode[] {
        // Placeholder logic: just return last N messages based on rough token calc
        // Real implementation needs token counting
        if (tokenLimit <= 0) return [];
        return nodes.slice(-10);
    }
}

export class ContextManager {
    private strategy: ContextStrategy;
    private conversationManager: ConversationManager;

    constructor(conversationManager: ConversationManager, strategy: ContextStrategy = new WindowStrategy()) {
        this.conversationManager = conversationManager;
        this.strategy = strategy;
    }

    async getContext(nodeId: string, tokenLimit: number = 4000): Promise<ConversationNode[]> {
        // 1. Get linear history (async)
        const history = await this.conversationManager.getHistory(nodeId);

        // 2. Apply compression strategy
        return this.strategy.compress(history, tokenLimit);
    }
}
