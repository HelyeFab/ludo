const bcrypt = require('bcrypt');

async function generateHashes() {
  const adminPassword = 'admin213';
  const viewerPassword = 'family123';

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const viewerHash = await bcrypt.hash(viewerPassword, 10);

  console.log('\n✅ Password Hashes Generated!\n');
  console.log('ADMIN_PASSWORD=' + adminHash);
  console.log('VIEWER_PASSWORD=' + viewerHash);
  console.log('\n');
}

generateHashes().catch(console.error);
