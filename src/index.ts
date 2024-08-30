import { commands, ExtensionContext, languages, Uri, window, workspace } from "coc.nvim";
import { ask } from "./main";
import { Message } from "./types";

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
      const messages: Message[] = [
        {
          role: "user",
          content: "```" + `${path || ""}\n${code}` + "```\n\n" + prompt,
        },
      ];
      await ask({
        title,
        model,
        messages,
        apiEndpoint,
        authorizationKey,
      });
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
