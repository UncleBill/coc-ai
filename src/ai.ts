import { Message } from "./types";

export interface AskAIOptions extends CreatePayloadOptions {
  apiEndpoint?: string;
  authorizationKey?: string;
}

export async function askAI({ model, messages, apiEndpoint, authorizationKey }: AskAIOptions) {
  // stream the response, return a readable stream
  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorizationKey ? `Bearer ${authorizationKey}` : undefined,
    },
    body: JSON.stringify(
      createPayload({
        model,
        messages,
      })
    ),
  });
  if (!response.ok) {
    console.log(`Failed to fetch ${apiEndpoint}`);
    return null;
  }
  return response;
}

interface CreatePayloadOptions {
  model?: string;
  messages: Array<Message>;
}

function createPayload({ model = "gpt-4o", messages }: CreatePayloadOptions) {
  return {
    model,
    stream: true,
    messages: [
      {
        role: "system",
        // based on Cursor's
        content: `You are an intelligent programmer. You are happy to help answer any questions that the user has (usually they will be about coding).

1. Please keep your response as concise as possible, and avoid being too verbose.

2. When the user is asking for edits to their code, please output a simplified version of the code block that highlights the changes necessary and adds comments to indicate where unchanged code has been skipped. For example:
// ... existing code ...
{{ edit_1 }}
// ... existing code ...
{{ edit_2 }}
// ... existing code ...
The user can see the entire file, so they prefer to only read the updates to the code. Often this will mean that the start/end of the file will be skipped, but that's okay! Rewrite the entire file only if specifically requested. Always provide a brief explanation of the updates, unless the user specifically requests only the code.

3. Do not lie or make up facts.

4. If a user messages you in a foreign language, please respond in that language.

5. Format your response in markdown.

6. When writing out new code blocks, please specify the language ID after the initial backticks, like so: 
{{ code }}

7. When writing out code blocks for an existing file, please also specify the file path after the initial backticks and restate the method / class your codeblock belongs to, like so:
function AIChatHistory() {
    ...
    {{ code }}
    ...
}
`,
      },
      ...messages,
    ],
    // max_tokens: 4096,
    n: 1,
    stop: null,
    temperature: 0.7,
  };
}
