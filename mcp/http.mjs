// Made by Jack (iamjustjack.de)
import { createServer } from 'node:http';
import { handle } from './server.mjs';

const PORT = Number(process.env.PORT ?? 3333);
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, mcp-session-id, mcp-protocol-version',
};

const reply = (res, status, body) => {
  res.writeHead(status, { ...CORS, ...(body === undefined ? {} : { 'content-type': 'application/json' }) });
  res.end(body === undefined ? undefined : JSON.stringify(body));
};

function answer(req) {
  if (req?.id === undefined || req?.id === null) return null;
  try {
    return { jsonrpc: '2.0', id: req.id, result: handle(req) };
  } catch (e) {
    return { jsonrpc: '2.0', id: req.id, error: { code: e.code ?? -32603, message: e.message } };
  }
}

createServer((req, res) => {
  if (req.method === 'OPTIONS') return reply(res, 204);
  if (req.method !== 'POST') return reply(res, 405, { jsonrpc: '2.0', id: null, error: { code: -32000, message: 'Use POST' } });
  let raw = '';
  req.on('data', (c) => {
    raw += c;
    if (raw.length > 1e6) req.destroy();
  });
  req.on('end', () => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return reply(res, 400, { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
    }
    if (Array.isArray(msg)) {
      const out = msg.map(answer).filter(Boolean);
      return out.length ? reply(res, 200, out) : reply(res, 202);
    }
    const out = answer(msg);
    return out ? reply(res, 200, out) : reply(res, 202);
  });
}).listen(PORT, () => console.log(`Paper Pop MCP on :${PORT}`));
