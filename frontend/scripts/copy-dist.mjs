import fs from 'fs';
import path from 'path';

const source = path.resolve('dist');
const target = path.resolve('..', 'dist');

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
