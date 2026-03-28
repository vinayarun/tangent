import { GeminiProvider } from '../packages/llm/src';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
    console.log('🧪 Diagnosing Gemini Models...');

    let apiKey = process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        console.log('⚠️  No VITE_GEMINI_API_KEY found in .env file.');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        apiKey = await new Promise<string>(resolve => {
            rl.question('   Please paste your API Key here to test: ', (answer) => {
                rl.close();
                resolve(answer.trim());
            });
        });
    }

    if (!apiKey) process.exit(1);

    // Try to list models (hacky via internal client access or raw fetch)
    // The new SDK doesn't expose listModels easily on the high level client instance in node?
    // Let's use raw fetch to the REST API to see what's actually available for this key.

    console.log('\n🔎 Querying API for available models...');
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log(`✅ Found ${data.models.length} models:`);
            data.models.forEach((m: any) => {
                if (m.name.includes('gemini')) {
                    console.log(`   - ${m.name.replace('models/', '')} (${m.supportedGenerationMethods?.join(', ')})`);
                }
            });
        } else {
            console.error('❌ Failed to list models:', data);
        }
    } catch (e) {
        console.error('❌ Network error listing models:', e);
    }

    // Test a specific known one again
    console.log('\n--- Retrying Standard Test ---');
    try {
        const provider = new GeminiProvider(apiKey, 'gemini-1.5-flash');
        const res = await provider.generateContent({ prompt: 'Hi' });
        console.log('✅ Generated:', res.text);
    } catch (e: any) {
        console.log('❌ Generate Failed:', e.message);
    }
}

main().catch(console.error);
