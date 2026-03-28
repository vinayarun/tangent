import { BaseEntity } from '../common/entity';

export enum EventType {
    // Conversation Events
    CONVERSATION_CREATED = 'conversation:created',
    CONVERSATION_UPDATED = 'conversation:updated',
    NODE_ADDED = 'conversation:node_added',
    NODE_UPDATED = 'conversation:node_updated',
    BRANCH_CREATED = 'conversation:branch_created',

    // Knowledge Graph Events
    ENTITY_CREATED = 'graph:entity_created',
    RELATION_CREATED = 'graph:relation_created',
    ENTITY_UPDATED = 'graph:entity_updated',

    // System Events
    ERROR = 'system:error',
    PLUGIN_LOADED = 'system:plugin_loaded',
}

/**
 * Represents atomic change in system state.
 */
export interface DomainEvent<T = unknown> extends BaseEntity {
    eventType: EventType;
    payload: T;
    sourceModule: string;
    timestamp: Date;
}
