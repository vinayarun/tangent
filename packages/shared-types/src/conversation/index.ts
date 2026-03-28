import { BaseEntity } from '../common/entity';

export type ConversationRole = 'user' | 'assistant' | 'system';

/**
 * Represents a complete research or thinking session.
 */
export interface ConversationSession extends BaseEntity {
    title: string;
    /** IDs of root nodes (usually just one, but supports multi-root if needed) */
    rootNodeIds: string[];
}

/**
 * Represents a single conversational step.
 * Fundamental unit of Tangent.
 */
export interface ConversationNode extends BaseEntity {
    sessionId: string;

    /** content of the message */
    content: string;

    role: ConversationRole;

    /** Parent node ID (null if root) */
    parentNodeId: string | null;

    /** Child node IDs (fork points) */
    childNodeIds: string[];

    /** IDs of linked Knowledge Entities */
    linkedKnowledgeIds?: string[];

    /** IDs of associated Summaries */
    summaryIds?: string[];
}

/**
 * Represents divergence of thought from a specific node.
 */
export interface Branch extends BaseEntity {
    /** The node from which this branch diverges */
    rootNodeId: string;

    /** Optional name for the branch */
    branchName?: string;

    /** Optional summary of the branch context */
    branchSummaryId?: string;
}
