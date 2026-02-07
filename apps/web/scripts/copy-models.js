import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'assets', 'models');
const destDir = path.join(root, 'public', 'models');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error('copy-models: failed to ensure directory', dir, error);
    throw error;
  }
}

async function copyModels() {
  await ensureDir(destDir);

  let sourceStats;
  try {
    sourceStats = await fs.stat(sourceDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.info('copy-models: no source models found, skipping');
      return;
    }
    console.error('copy-models: failed to read source', error);
    throw error;
  }

  if (!sourceStats.isDirectory()) {
    console.info('copy-models: source is not a directory, skipping');
    return;
  }

  try {
    await fs.cp(sourceDir, destDir, { recursive: true });
    console.info('copy-models: copied models to public/models');
  } catch (error) {
    console.error('copy-models: copy failed', error);
    throw error;
  }
}

copyModels();
