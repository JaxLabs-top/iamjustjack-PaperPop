// Made by Jack (iamjustjack.de)
// Vite plugin for sites that use Paper Pop as a submodule: plugins: [react(), paperpop()] with  import { paperpop } from './paperpop/vite';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export function paperpop(): Plugin {
  return {
    name: 'paperpop',
    config: () => ({
      resolve: {
        alias: [
          { find: /^paperpop$/, replacement: `${root}src/index.ts` },
          { find: /^paperpop\/(.*)$/, replacement: `${root}src/$1` },
        ],
        dedupe: ['react', 'react-dom'],
      },
    }),
  };
}

export default paperpop;
