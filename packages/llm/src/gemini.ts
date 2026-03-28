import { GoogleGenAI } from '@google/genai';
import { LLMProvider, CompletionRequest, CompletionResponse } from './provider';

export class GeminiProvider implements LLMProvider {
    private client: GoogleGenAI;
    private modelName: string;

    constructor(apiKey: string, modelName: string = 'gemini-flash-latest') {
        this.client = new GoogleGenAI({ apiKey });
        this.modelName = modelName;
    }

    async generateContent(request: CompletionRequest): Promise<CompletionResponse> {
        try {
            let response;

            if (request.history && request.history.length > 0) {
                const contents = request.history.map(h => ({
                    role: h.role,
                    parts: h.parts.map(p => ({ text: p }))
                }));
                // Add the current prompt as the last user message
                contents.push({ role: 'user', parts: [{ text: request.prompt }] });

                const res = await this.client.models.generateContent({
                    model: this.modelName,
                    contents: contents as any,
                    config: {
                        temperature: request.temperature,
                    }
                });
                response = res;

            } else {
                const res = await this.client.models.generateContent({
                    model: this.modelName,
                    contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
                    config: {
                        temperature: request.temperature,
                    }
                });
                response = res;
            }

            // In new SDK, response.text is a getter property, NOT a function.
            const text = response.text;

            return {
                text: text || '',
                raw: response,
                usage: {
                    promptTokens: 0,
                    completionTokens: 0
                }
            };
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }
}
