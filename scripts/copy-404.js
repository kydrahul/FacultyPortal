import fs from 'fs';
import path from 'path';

const distPath = path.resolve('dist');
const indexPath = path.join(distPath, 'index.html');
const notFoundPath = path.join(distPath, '404.html');

if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('Successfully copied index.html to 404.html for GitHub Pages SPA support.');
} else {
    console.error('Error: dist/index.html does not exist. Ensure the build completed successfully.');
    process.exit(1);
}
