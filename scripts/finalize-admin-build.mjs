import { copyFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const outputDir = resolve('dist-admin');
const source = resolve(outputDir, 'index.admin.html');
const destination = resolve(outputDir, 'index.html');

// Vite retains the source HTML filename for this multi-page input. Workers
// static assets need index.html at the asset root to serve the Worker URL.
await access(source, constants.R_OK);
await copyFile(source, destination);
await access(destination, constants.R_OK);
console.log('Verified admin entry point: dist-admin/index.html');
