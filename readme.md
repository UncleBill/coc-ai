# coc-ai

coc-ai is a custom coc.nvim plugin that integrates AI-powered code assistance into Neovim/Vim.

> **Warning**: This project is in its early stages and may be unstable or incomplete. Use with caution.

## Features

- Ask AI for code-related questions and suggestions
- Supports various AI models (e.g., GPT-4, GPT-4-mini, llama3)
- Configurable API endpoint and authorization key
- Code action integration for easy access

## Installation

1. Make sure you have [coc.nvim](https://github.com/neoclide/coc.nvim) installed.
2. Run `:CocInstall coc-ai`

## Configuration

Add the following configurations to your `coc-settings.json`:

```json
{
  "ai.authorizationKey": "<your-api-key-here>",
  "ai.model": "gpt-4o",
  "ai.apiEndpoint": "<your-api-endpoint-here>"
}
```

## Usage

1. Use the command `:CocCommand coc-ai.ask` to prompt the AI with a question.
2. Select a code block in visual mode and run the command to ask about the selected code.
3. Use the "Ask AI" code action in supported file types.

## Development

To set up the development environment:

1. Clone the repository
2. Run `pnpm install` to install dependencies
3. Use `pnpm run build` to compile the TypeScript code
4. Use `pnpm run watch` for continuous compilation during development

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

