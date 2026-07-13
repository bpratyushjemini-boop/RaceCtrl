const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

function checkFile(filePath) {
  // Strip query params or hash if any
  const cleanPath = filePath.split(/[?#]/)[0];
  const absolutePath = path.join(PUBLIC_DIR, cleanPath);
  return fs.existsSync(absolutePath);
}

function auditRegistryFile(fileName) {
  const filePath = path.join(ROOT_DIR, 'lib', 'media', fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: Registry file not found at ${filePath}`);
    return { issues: 0, count: 0 };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Matches values like "/media/..."
  const regex = /["'](\/media\/[^"']+)["']/g;
  let match;
  let issues = 0;
  const foundPaths = [];
  
  while ((match = regex.exec(content)) !== null) {
    const assetPath = match[1];
    foundPaths.push(assetPath);
    if (!checkFile(assetPath)) {
      console.error(`ERROR: Missing asset at "${assetPath}" referenced in "lib/media/${fileName}"`);
      issues++;
    }
  }
  
  return { issues, count: foundPaths.length };
}

console.log('Auditing RaceCtrl media registry assets...');
const driversAudit = auditRegistryFile('drivers.ts');
const constructorsAudit = auditRegistryFile('constructors.ts');
const circuitsAudit = auditRegistryFile('circuits.ts');

const totalIssues = driversAudit.issues + constructorsAudit.issues + circuitsAudit.issues;
console.log(`Audit complete: verified ${driversAudit.count + constructorsAudit.count + circuitsAudit.count} registered assets.`);

if (totalIssues > 0) {
  console.error(`Audit failed with ${totalIssues} missing assets.`);
  process.exit(1);
} else {
  console.log('All registered assets verified successfully.');
  process.exit(0);
}
