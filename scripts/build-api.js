import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function buildApi() {
  console.log('📦 Bundling Vercel serverless API handler...');
  try {
    await esbuild.build({
      entryPoints: [path.join(rootDir, 'server', 'api-handler.ts')],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      packages: 'external',
      outfile: path.join(rootDir, 'api', 'index.js'),
    });
    console.log('✅ Serverless API handler bundled successfully to api/index.js');
  } catch (err) {
    console.error('❌ Failed to bundle API:', err);
    process.exit(1);
  }
}

buildApi();
