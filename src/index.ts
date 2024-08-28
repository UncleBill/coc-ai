import { commands, ExtensionContext, languages, Uri, window, workspace } from "coc.nvim";
import { askAI } from "./ai";
import { llamaReader } from "./llama-reader";
import { openaiReader } from "./openai-reader";

export async function activate(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand("coc-ai.ask", async () => {
      const document = await workspace.document;
      const mode = (await workspace.nvim.call("visualmode")) as string;
      let range = mode ? await window.getSelectedRange("visualmode") : null;

      const code = document.textDocument.getText(range);
      // Request user input with coc floating input
      const prompt = await window.requestInput("What to do?");
      if (!prompt) return;

      const config = workspace.getConfiguration("ai");
      const authorizationKey = config.get<string>("authorizationKey");
      const model = config.get<string>("model") ?? "gpt-4o";
      const apiEndpoint = config.get<string>("apiEndpoint");

      const title = `Ask AI(${model}): ${prompt}`;
      const path = workspace.asRelativePath(Uri.parse(document.uri).fsPath);
      await window.withProgress(
        {
          title,
          cancellable: true,
        },
        async (progress, token) => {
          const response = await askAI({
            path,
            code,
            prompt,
            apiEndpoint,
            authorizationKey,
            model,
          });
          if (!response.body) return;
          let content = "";
          const reader = model.startsWith("llama") ? llamaReader : openaiReader;
          for await (let text of reader(response.body)) {
            content += text;
            progress.report({
              message: `(${content.length})${content}`,
            });
          }
          if (token.isCancellationRequested) return;

          const dialog = await window.showDialog({
            title,
            content,
            highlight: "markdown",
            buttons: [
              { index: 0, text: "[x]close" },
              { index: 1, text: "[y]copy and close" },
            ],
            async callback(index) {
              if (index === 0) {
                dialog.dispose();
              } else if (index === 1) {
                await workspace.nvim.call("setreg", ["+", content]);
                window.showMessage("Text copied to clipboard");
              }
            },
          });
        }
      );
    })
  );

  // Register the code action provider
  context.subscriptions.push(
    languages.registerCodeActionProvider(
      ["*"],
      {
        provideCodeActions: () => {
          return [
            {
              title: "Ask AI",
              command: "coc-ai.ask",
              isPreferred: false,
              kind: "refactor.suggestion",
            },
          ];
        },
      },
      "refactor.suggestion"
    )
  );
}
