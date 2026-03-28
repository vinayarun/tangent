import { GeminiProvider } from '../packages/llm/src';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
    console.log('🧪 Testing Gemini API Integration (gemini-flash-latest)...');

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

    try {
        const provider = new GeminiProvider(apiKey, 'gemini-flash-latest');
        console.log('   Provider initialized with gemini-flash-latest.');

        const start = Date.now();
        const response = await provider.generateContent({
            prompt: 'Hello, confirm you are working.'
        });

        console.log(`\n✅ SUCCESS in ${Date.now() - start}ms!`);
        console.log(`   Output: "${response.text}"`);

    } catch (error: any) {
        console.error('❌ Failed:', error.message);
        if (error.response) console.error(JSON.stringify(error.response, null, 2));
    }
}

main().catch(console.error);
