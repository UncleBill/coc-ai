import { window, workspace } from "coc.nvim";
import { askAI, AskAIOptions } from "./ai";
import { llamaReader } from "./llama-reader";
import { openaiReader } from "./openai-reader";
import { Message } from "./types";
import { printConversation } from "./utils";

interface Options extends AskAIOptions {
  title: string;
  model: string;
}
export async function ask(options: Options) {
  const { model, title, messages, apiEndpoint, authorizationKey } = options;
  const response = await window.withProgress(
    {
      title,
      cancellable: true,
    },
    async (progress, token) => {
      const response = await askAI({
        messages,
        apiEndpoint,
        authorizationKey,
        model,
      });
      if (!response?.body) return "body empty";
      let content = "";
      const reader = model.startsWith("llama") ? llamaReader : openaiReader;
      try {
        for await (let text of reader(response.body, token.isCancellationRequested)) {
          content += text;
          progress.report({
            message: `(${content.length})${content}`,
          });
        }
        if (token.isCancellationRequested) return "cancel";
        return content;
      } catch (err) {
        return (err as Error).message;
      }
    }
  );

  const newMessages: Message[] = [...messages, { role: "assistant", content: response }];
  const conversation = printConversation(newMessages);

  const dialog = await window.showDialog({
    title,
    content: conversation,
    buttons: [
      { index: 0, text: "[x]Close" },
      { index: 1, text: "[y]Copy and close" },
      { index: 2, text: "[z]Followup" },
    ],
    async callback(index) {
      if (index === 0) {
        dialog.dispose();
      } else if (index === 1) {
        await workspace.nvim.call("setreg", ["+", response]);
        window.showMessage("Text copied to clipboard");
      } else if (index === 2) {
        const prompt = await window.requestInput("What's next?");
        if (!prompt) return;
        await ask({
          ...options,
          messages: [...newMessages, { role: "user", content: prompt }],
        });
      }
    },
  });
  await workspace.nvim.command(`${dialog.bufnr}bufdo normal G`);
}
