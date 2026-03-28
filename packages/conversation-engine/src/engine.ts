import {
    ConversationSession,
    ConversationNode,
    Branch,
    ConversationRole,
    EventType
} from '@tangent/shared-types';
import { IEventBus, globalEventBus } from '@tangent/event-bus';

// Define a minimal interface to avoid strict coupling to full adapter if desired, 
// but using the one from persistence is fine.
export interface StorageAdapter {
    getItem<T>(key: string): Promise<T | null>;
    setItem<T>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
}

export class ConversationManager {
    private sessions: Map<string, ConversationSession> = new Map();
    private nodes: Map<string, ConversationNode> = new Map();
    private branches: Map<string, Branch> = new Map();
    private bus: IEventBus;
    private sessionStorage?: StorageAdapter;
    private nodeStorage?: StorageAdapter;

    constructor(
        bus: IEventBus = globalEventBus,
        sessionStorage?: StorageAdapter,
        nodeStorage?: StorageAdapter
    ) {
        this.bus = bus;
        this.sessionStorage = sessionStorage;
        this.nodeStorage = nodeStorage;
    }

    async loadSession(id: string): Promise<ConversationSession | undefined> {
        if (this.sessions.has(id)) return this.sessions.get(id);
        if (!this.sessionStorage) return undefined;

        const session = await this.sessionStorage.getItem<ConversationSession>(id);
        if (session) {
            this.sessions.set(session.id, session);
            // In a real app, we might load nodes lazily. 
            // For now, if we have nodeStorage, we might assume they are loaded on demand by getHistory or getNode
        }
        return session || undefined;
    }

    async createSession(title: string = 'New Conversation'): Promise<ConversationSession> {
        const id = crypto.randomUUID();
        const session: ConversationSession = {
            id,
            title,
            rootNodeIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            metadata: {}
        };

        this.sessions.set(id, session);
        await this.sessionStorage?.setItem(id, session);
        this.bus.emit(EventType.CONVERSATION_CREATED, session);
        return session;
    }

    async addMessage(
        sessionId: string,
        role: ConversationRole,
        content: string,
        parentNodeId: string | null = null
    ): Promise<ConversationNode> {
        let session = this.sessions.get(sessionId);
        if (!session) {
            session = await this.loadSession(sessionId);
            if (!session) throw new Error(`Session ${sessionId} not found`);
        }

        // Verify parent exists if provided
        if (parentNodeId && !this.nodes.has(parentNodeId)) {
            // Try loading parent
            if (this.nodeStorage) {
                const parent = await this.nodeStorage.getItem<ConversationNode>(parentNodeId);
                if (parent) {
                    this.nodes.set(parent.id, parent);
                } else {
                    throw new Error(`Parent node ${parentNodeId} not found`);
                }
            } else {
                throw new Error(`Parent node ${parentNodeId} not found`);
            }
        }

        const nodeId = crypto.randomUUID();
        const newNode: ConversationNode = {
            id: nodeId,
            sessionId,
            role,
            content,
            parentNodeId,
            childNodeIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            metadata: {}
        };

        this.nodes.set(nodeId, newNode);
        await this.nodeStorage?.setItem(nodeId, newNode);

        // Update topology
        if (parentNodeId) {
            const parent = this.nodes.get(parentNodeId)!;
            parent.childNodeIds.push(nodeId);
            parent.updatedAt = new Date();
            await this.nodeStorage?.setItem(parentNodeId, parent);
            this.bus.emit(EventType.NODE_UPDATED, parent);
        } else {
            session.rootNodeIds.push(nodeId);
        }

        // Update session
        session.updatedAt = new Date();
        session.version++;
        await this.sessionStorage?.setItem(sessionId, session);

        this.bus.emit(EventType.NODE_ADDED, { node: newNode });
        this.bus.emit(EventType.CONVERSATION_UPDATED, session);

        return newNode;
    }

    createBranch(rootNodeId: string, name?: string): Branch {
        if (!this.nodes.has(rootNodeId)) {
            throw new Error(`Node ${rootNodeId} not found`);
        }

        const branchId = crypto.randomUUID();
        const branch: Branch = {
            id: branchId,
            rootNodeId,
            branchName: name,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            metadata: {}
        };

        this.branches.set(branchId, branch);
        this.bus.emit(EventType.BRANCH_CREATED, branch);

        return branch;
    }

    getSession(id: string): ConversationSession | undefined {
        return this.sessions.get(id);
    }

    // Async version of getNode
    async getNode(id: string): Promise<ConversationNode | undefined> {
        if (this.nodes.has(id)) return this.nodes.get(id);
        if (this.nodeStorage) {
            const node = await this.nodeStorage.getItem<ConversationNode>(id);
            if (node) {
                this.nodes.set(id, node);
                return node;
            }
        }
        return undefined;
    }

    /**
     * Returns the linear history from root to the specified node.
     * Async because it might need to load nodes.
     */
    async getHistory(nodeId: string): Promise<ConversationNode[]> {
        const history: ConversationNode[] = [];
        let current = await this.getNode(nodeId);

        while (current) {
            history.unshift(current);
            if (current.parentNodeId) {
                current = await this.getNode(current.parentNodeId);
            } else {
                current = undefined;
            }
        }
        return history;
    }
}
