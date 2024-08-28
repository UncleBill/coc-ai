import { type ReadableStream } from "stream/web";
import { TextDecoder } from "node:util";

export async function* openaiReader(stream: ReadableStream) {
  const reader = stream.getReader();
  let content = "";
  const decoder = new TextDecoder();
  const PREFIX = "data: ";
  const PREFIX_OFFSET = PREFIX.length;
  var slice_offset = -1;
  var json = "";
  while (true) {
    const { done, value } = await reader?.read();
    content += done ? "" : decoder.decode(value);
    do {
      if (slice_offset !== -1 && content.length) {
        json = content.slice(PREFIX_OFFSET, slice_offset);
        if (json.trim() === "[DONE]") break;
        const text = JSON.parse(json).choices[0].delta.content;
        content = content.slice(slice_offset);
        if (text) yield text;
      }
      if (done && !content.length) break;
      slice_offset = done ? content.length : content.indexOf(PREFIX, PREFIX.length);
    } while (slice_offset !== -1);
    if (done) break;
  }
}
