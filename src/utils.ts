import { Message } from "./types";

export function printConversation(messages: Message[]) {
  return messages
    .filter((x) => x.role !== "system")
    .map((x) => {
      return `${x.role}\n${"~".repeat(x.role.length)}\n${x.content}`;
    })
    .join("\n\n");
}
