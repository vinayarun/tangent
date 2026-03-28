import { BaseEntity } from '../common/entity';

export interface Claim extends BaseEntity {
    statement: string;
    confidenceScore?: number;
    /** IDs of supporting Evidence */
    supportingEvidenceIds?: string[];
    /** IDs of contradicting Evidence */
    contradictingEvidenceIds?: string[];
}

export type EvidenceSourceType = 'conversation' | 'external' | 'inference';

export interface Evidence extends BaseEntity {
    content: string;
    sourceType: EvidenceSourceType;
    /** ID of source ConversationNode if applicable */
    sourceNodeId?: string;
}
