import { readFileSync } from 'node:fs';
import { createApp } from './app.mjs';

const content = JSON.parse(readFileSync(new URL('../../content/examples/ronde.json', import.meta.url), 'utf8'));
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';
const { server } = createApp({ content });
server.listen(port, host, () => console.log(`Server draait op http://${host}:${port} — Ctrl+C om te stoppen.`));
