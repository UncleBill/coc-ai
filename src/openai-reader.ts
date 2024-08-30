import { type ReadableStream } from "stream/web";
import { TextDecoder } from "node:util";

export async function* openaiReader(stream: ReadableStream, abort?: boolean) {
  const reader = stream.getReader();
  let content = "";
  const decoder = new TextDecoder();
  const PREFIX = "data: ";
  const PREFIX_OFFSET = PREFIX.length;
  var slice_offset = -1;
  var raw = "";
  while (true) {
    if (abort) return;
    const { done, value } = await reader?.read();
    const decoded = decoder.decode(value);
    if (decoded === "data: [DONE]") break;
    if (decoded && !decoded.startsWith("data:")) continue;
    content += done ? "" : decoded;
    do {
      if (slice_offset !== -1 && content.length) {
        raw = content.slice(PREFIX_OFFSET, slice_offset);
        if (raw.trim() === "[DONE]") break;
        const json = JSON.parse(raw);
        if (json.error) {
          throw new Error(json.error.message);
        }
        const text = json.choices[0].delta.content;
        content = content.slice(slice_offset);
        if (text) yield text;
      }
      if (done && !content.length) break;
      slice_offset = done ? content.length : content.indexOf(PREFIX, PREFIX.length);
    } while (slice_offset !== -1);
    if (done) break;
  }
}
