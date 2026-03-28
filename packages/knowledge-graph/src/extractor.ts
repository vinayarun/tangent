import {
    ConversationNode,
    KnowledgeEntityType,
    EventType
} from '@tangent/shared-types';
import { IEventBus, globalEventBus } from '@tangent/event-bus';
import { GraphStore } from './store';

import { LLMProvider } from '@tangent/llm';

export class GraphExtractor {
    private bus: IEventBus;
    private store: GraphStore;
    private llm?: LLMProvider;

    constructor(store: GraphStore, bus: IEventBus = globalEventBus, llm?: LLMProvider) {
        this.store = store;
        this.bus = bus;
        this.llm = llm;
        this.setupListeners();
    }

    private setupListeners() {
        this.bus.on(EventType.NODE_ADDED, this.handleNodeAdded.bind(this));
    }

    private handleNodeAdded(payload: { node: ConversationNode }) {
        const { node } = payload;
        if (node.role === 'user' || node.role === 'assistant') {
            this.extractEntities(node);
        }
    }

    public setLLMProvider(llm: LLMProvider) {
        this.llm = llm;
    }

    private async extractEntities(node: ConversationNode) {
        const content = node.content;

        // 1. Regex Heuristic (Fast, Deterministic)
        const wikiRegex = /\[\[(.*?)\]\]/g;
        let match;
        while ((match = wikiRegex.exec(content)) !== null) {
            const label = match[1];
            await this.store.addEntity(label, KnowledgeEntityType.TOPIC);
            console.log(`[Extractor] Regex entity: ${label}`);
        }

        // 2. LLM Extraction (Smart, Slow)
        if (this.llm) {
            try {
                const prompt = `
                Extract key topics/concepts from the following text as a JSON list of strings.
                Only extract significant nouns/concepts.
                Text: "${content}"
                Example output: ["Quantum Mechanics", "Schrodinger's Cat"]
                `;

                const response = await this.llm.generateContent({
                    prompt,
                    // Force JSON if provider supports or just parse text
                    responseSchema: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                });

                let entities: string[] = [];
                // Simple parsing for MVP
                try {
                    // Clean markdown code blocks if any
                    let clean = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
                    entities = JSON.parse(clean);
                } catch (e) {
                    console.warn('Failed to parse LLM JSON', e);
                }

                if (Array.isArray(entities)) {
                    for (const label of entities) {
                        // Avoid duplicates if regex already caught it? 
                        // GraphStore should handle dedup ideally, but for now we trust it.
                        await this.store.addEntity(label, KnowledgeEntityType.TOPIC);
                        console.log(`[Extractor] LLM entity: ${label}`);
                    }
                }

            } catch (err) {
                console.error('[Extractor] LLM failure', err);
            }
        }
    }
}
