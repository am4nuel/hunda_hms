const fs = require('fs');
const path = require('path');

const controllersDir = 'c:\\Users\\Abeni\\OneDrive\\Desktop\\hunda\\Hotel\\server\\controllers';
const files = fs.readdirSync(controllersDir);

files.forEach(file => {
  if (!file.endsWith('.js')) return;
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to find the vulnerable pattern and replace it
  // Pattern: const hotelId = req.user?.hotelId || req.hotelId;
  const regex = /const hotelId = req\.user\?\.hotelId \|\| req\.hotelId;/g;
  const replacement = 'const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;\n    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });';
  
  if (content.match(regex)) {
    console.log(`Patching ${file}...`);
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content);
  }
});
