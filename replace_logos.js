const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src -type f -name "*.tsx"').toString().split('\n').filter(Boolean);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (content.includes('amazon-logo.svg')) { content = content.replace(/amazon-logo\.svg/g, 'amazon-logo.png'); changed = true; }
  if (content.includes('meesho-logo.svg')) { content = content.replace(/meesho-logo\.svg/g, 'meesho-logo.png'); changed = true; }
  if (content.includes('shopify-logo.svg')) { content = content.replace(/shopify-logo\.svg/g, 'shopify-logo.png'); changed = true; }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
