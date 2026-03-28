# Tangent Project Status Report

**Date:** 2026-02-15
**Status:** MVP Vertical Slice Integrated with Gemini 2.0 AI

## 🚀 Accomplishments
1.  **AI Engine Migration**: successfully migrated from the older `@google/generative-ai` to the new stable **`@google/genai`** SDK.
2.  **Model Discovery**: Identified that `gemini-flash-latest` is the most reliable model alias for the current API Key/Region, resolving 404 (Not Found) and 429 (Quota) errors.
3.  **Core Services Wired**: 
    *   `ChatView` triggers real-time responses from Gemini.
    *   `GraphExtractor` uses Gemini to automatically identify concepts from conversation nodes.
    *   `SettingsView` manages secure API Key storage in LocalStorage.
4.  **Security**: Configured `.env` and `.gitignore` to prevent API key leaks.

## 🐞 Identified Issues
### UI & UX
*   **Graph Readability**: Knowledge Graph nodes currently render with light grey text on white/grey backgrounds, making them very difficult to read.
*   **Markdown Rendering**: AI responses are displayed as raw text. Markdown formatting (bolding, bullet points, code blocks) is not yet rendered.
*   **Chat Input Layout**: While improved, the input box anchoring still needs validation across different window sizes to ensure it's never cut off.

### Chat Logic
*   **Response Formatting**: Some responses appear with a "mock-style" prefix (`I heard you say...`). This suggests either an old build is running or there is a logic overlap between the `ConversationManager` and the AI responder service.
*   **Duplicate Text**: Observed duplication of user input within the assistant's quoted section.

## 🛠 Next Steps
1.  **Markdown Integration**: Add `react-markdown` to `ChatView.tsx` to properly render Gemini's rich text output.
2.  **Graph Styling Update**: 
    *   Modify `@xyflow/react` node styles in `GraphView.tsx` for higher contrast.
    *   Implement a proper layout engine (e.g., `dagre` or improved `elkjs` integration) so nodes aren't randomly placed.
3.  **Response Cleanup**:
    *   Audit `ChatView.tsx` to ensure no legacy mock strings remain.
    *   Refine the SYSTEM prompt for the LLM to prevent it from echoing user input unnecessarily.
4.  **Persistent Layout**: Save graph node positions to `localStorage` or a database so history is preserved across reloads.
5.  **Desktop Binary Build**: Resolve the `cargo` dependency issue to enable `pnpm tauri build` for creating the actual `.app`/`.exe` binaries.

---
*End of session. Tangent is now "Smart" and ready for UI polish.*
