
export interface CompletionRequest {
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
    // JSON schema for structured output (Gemini supports this)
    responseSchema?: any;
    history?: { role: 'user' | 'model'; parts: string[] }[];
}

export interface CompletionResponse {
    text: string;
    // Raw response if needed
    raw?: any;
    usage?: {
        promptTokens: number;
        completionTokens: number;
    };
}

export interface LLMProvider {
    generateContent(request: CompletionRequest): Promise<CompletionResponse>;
    streamContent?(request: CompletionRequest): Promise<AsyncIterable<string>>;
}
