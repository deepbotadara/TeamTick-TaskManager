import { access, rm } from 'node:fs/promises';
import path from 'node:path';

const lockPath = path.join(process.cwd(), '.next', 'dev', 'lock');

try {
  await access(lockPath);
  await rm(lockPath, { force: true });
  console.log('Removed stale Next.js dev lock file.');
} catch {
  // No lock file present.
}
