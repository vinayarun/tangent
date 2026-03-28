import { BaseEntity } from '../common/entity';

export enum KnowledgeEntityType {
    CONCEPT = 'concept',
    TOPIC = 'topic',
    QUESTION = 'question',
    ENTITY = 'entity',
}

export enum KnowledgeRelationType {
    RELATED_TO = 'related_to',
    IS_A = 'is_a',
    HAS_A = 'has_a',
    CAUSES = 'causes',
    CONTRADICTS = 'contradicts',
}

/**
 * Represents a concept, topic, or idea extracted from conversation.
 */
export interface KnowledgeEntity extends BaseEntity {
    label: string;
    type: KnowledgeEntityType;
    description?: string;
}

/**
 * Represents conceptual relationship between entities.
 */
export interface KnowledgeRelation extends BaseEntity {
    sourceEntityId: string;
    targetEntityId: string;
    relationType: KnowledgeRelationType;
    weight?: number;
}
