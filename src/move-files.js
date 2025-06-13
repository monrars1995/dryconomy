import { promises as fs } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function moveFiles() {
  // Create directories if they don't exist
  const dirs = [
    'src',
    'src/components',
    'src/config',
    'src/hooks',
    'src/services',
    'src/pages',
    'src/pages/admin'
  ];
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.error(`Error creating directory ${dir}:`, err);
      }
    }
  }

  // Files to move
  const moves = [
    { from: 'App.jsx', to: 'src/App.jsx' },
    { from: 'main.jsx', to: 'src/main.jsx' },
    { from: 'components/ROICalculator.jsx', to: 'src/components/ROICalculator.jsx' },
    { from: 'components/PrivacyBanner.jsx', to: 'src/components/PrivacyBanner.jsx' },
    { from: 'components/ContentSection.jsx', to: 'src/components/ContentSection.jsx' },
    { from: 'config/cityParameters.js', to: 'src/config/cityParameters.js' }
  ];

  // Move files
  for (const { from, to } of moves) {
    try {
      const exists = await fs.access(from).then(() => true).catch(() => false);
      if (exists) {
        await fs.rename(from, to);
        console.log(`Moved ${from} to ${to}`);
      }
    } catch (err) {
      console.error(`Error moving ${from} to ${to}:`, err);
    }
  }

  // Clean up empty directories
  try {
    const componentsEmpty = await fs.readdir('components').then(files => files.length === 0).catch(() => false);
    if (componentsEmpty) {
      await fs.rmdir('components');
      console.log('Removed empty components directory');
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error cleaning up components directory:', err);
    }
  }

  try {
    const configEmpty = await fs.readdir('config').then(files => files.length === 0).catch(() => false);
    if (configEmpty) {
      await fs.rmdir('config');
      console.log('Removed empty config directory');
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error cleaning up config directory:', err);
    }
  }
}

moveFiles().catch(console.error);
