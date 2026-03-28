import { ConversationNode, KnowledgeEntity, EventType } from '@tangent/shared-types';

export const EVENTS = {
    CONVERSATION: {
        CREATED: EventType.CONVERSATION_CREATED,
        UPDATED: EventType.CONVERSATION_UPDATED,
        NODE_ADDED: EventType.NODE_ADDED,
        NODE_UPDATED: EventType.NODE_UPDATED,
        BRANCH_CREATED: EventType.BRANCH_CREATED,
    },
    GRAPH: {
        ENTITY_CREATED: EventType.ENTITY_CREATED,
        RELATION_CREATED: EventType.RELATION_CREATED,
        ENTITY_UPDATED: EventType.ENTITY_UPDATED,
    },
    SYSTEM: {
        ERROR: EventType.ERROR,
        PLUGIN_LOADED: EventType.PLUGIN_LOADED,
    }
} as const;

// Type definitions for event payloads
export interface NodeAddedPayload {
    node: ConversationNode;
}

export interface EntityCreatedPayload {
    entity: KnowledgeEntity;
}
