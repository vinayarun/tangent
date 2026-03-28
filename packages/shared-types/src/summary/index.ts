import { BaseEntity } from '../common/entity';

export enum SummaryLevel {
    SENTENCE = 'sentence',
    PARAGRAPH = 'paragraph',
    SYNTHESIS = 'synthesis',
}

export type SummaryTargetType = 'node' | 'branch' | 'session';

/**
 * Stores progressive abstraction of information.
 */
export interface SummaryLayer extends BaseEntity {
    targetEntityId: string;
    targetEntityType: SummaryTargetType;
    summaryLevel: SummaryLevel;
    content: string;
    /** Info about the model that generated this summary */
    modelInfo?: {
        model: string;
        provider: string;
    };
}
