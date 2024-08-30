import { type ReadableStream } from "stream/web";
import { TextDecoder } from "node:util";

export async function* llamaReader(stream: ReadableStream, abort?: boolean) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  while (true) {
    if (abort) return;
    const { done, value } = await reader?.read();
    if (done) break;
    const decoded = decoder.decode(value);
    const chunk = JSON.parse(decoded);
    const text = chunk.message.content;
    yield text;
  }
}
