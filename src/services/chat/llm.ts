// services/chat/llm.ts
export type BackendSSE =
  | { type: 'assistant'; content: string }
  | { type: 'tool_call'; content: any }
  | { type: 'tool_message'; content: string }
  | { type: 'done' };

export interface StreamChatParams {
  apiBase?: string; // p.ej. process.env.NEXT_PUBLIC_API_BASE_URL
  message: string;
  userId: string;
  convId: string;
  signal?: AbortSignal;
}


export async function* streamBackendChat({
  apiBase = process.env.BACKEND_URL ?? 'http://localhost:8000',
  message,
  userId,
  convId,
  signal,
}: StreamChatParams): AsyncGenerator<BackendSSE, void, unknown> {
  const url = `${apiBase.replace(/\/$/, '')}/api/chat/`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, user_id: userId, conv_id: convId }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`SSE request failed: ${res.status} ${res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Procesa chunks separados por doble salto de línea, estándar SSE. :contentReference[oaicite:2]{index=2}
    let boundary: number;
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const chunk = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      // Cada “evento” puede traer varias líneas; nos quedamos con las que empiezan con "data:"
      const lines = chunk
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).trim());

      for (const data of lines) {
        if (!data) continue;
        if (data === '[DONE]') {
          yield { type: 'done' };
          return;
        }
        try {
          const evt = JSON.parse(data) as { type: string; content: any };
          if (evt?.type === 'assistant') {
            yield { type: 'assistant', content: String(evt.content ?? '') };
          } else if (evt?.type === 'tool_call') {
            yield { type: 'tool_call', content: evt.content };
          } else if (evt?.type === 'tool_message') {
            yield { type: 'tool_message', content: String(evt.content ?? '') };
          } // ignora tipos desconocidos
        } catch {
          // A veces llegan heartbeats / keep-alives o logs; los ignoramos
        }
      }
    }
  }
}

export async function collectAssistantText(params: StreamChatParams): Promise<string> {
  let text = '';
  for await (const evt of streamBackendChat(params)) {
    if (evt.type === 'assistant') text += evt.content;
  }
  return text;
}
