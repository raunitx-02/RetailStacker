const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src -type f -name "*.tsx"').toString().split('\n').filter(Boolean);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (content.includes('amazon-logo.png')) { content = content.replace(/amazon-logo\.png/g, 'amazon-logo.svg'); changed = true; }
  if (content.includes('meesho-logo.png')) { content = content.replace(/meesho-logo\.png/g, 'meesho-logo.svg'); changed = true; }
  if (content.includes('shopify-logo.png')) { content = content.replace(/shopify-logo\.png/g, 'shopify-logo.svg'); changed = true; }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
