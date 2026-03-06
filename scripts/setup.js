#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('\n🚀 Panopticon Engine - Setup Helper\n');

// Create .env from example if it doesn't exist
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  
  if (fs.existsSync(envExamplePath)) {
    let envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    // Auto-generate JWT secret
    const jwtSecret = crypto.randomBytes(32).toString('base64');
    envContent = envContent.replace(
      'JWT_SECRET=your-random-secret-key-here',
      `JWT_SECRET=${jwtSecret}`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created');
    console.log('✅ JWT_SECRET auto-generated\n');
    console.log('⚠️  IMPORTANT: You still need to add Supabase credentials:');
    console.log('   1. Go to https://supabase.com');
    console.log('   2. Create a new project (takes 2 minutes)');
    console.log('   3. Go to Settings → API');
    console.log('   4. Copy SUPABASE_URL and SUPABASE_SERVICE_KEY');
    console.log('   5. Add them to your .env file\n');
  }
} else {
  console.log('ℹ️  .env file already exists\n');
}

// Create logs directory
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ Logs directory created\n');
}

console.log('🎉 Setup complete!\n');
console.log('Next steps:');
console.log('  1. Add Supabase credentials to .env (see above)');
console.log('  2. Run migration: psql $SUPABASE_URL -f migrations/*.sql');
console.log('  3. npm run dev\n');
