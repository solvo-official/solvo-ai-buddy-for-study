import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function buildApi() {
  console.log('📦 Bundling Vercel serverless API handlers...');
  try {
    await esbuild.build({
      entryPoints: [
        path.join(rootDir, 'api', 'index.ts'),
        path.join(rootDir, 'api', '[...slug].ts'),
      ],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      packages: 'external',
      outdir: path.join(rootDir, 'api'),
      outExtension: { '.js': '.js' },
    });
    console.log('✅ Serverless API handlers bundled successfully to api/index.js and api/[...slug].js');
  } catch (err) {
    console.error('❌ Failed to bundle API:', err);
    process.exit(1);
  }
}

buildApi();
