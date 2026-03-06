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
    
    console.log('⚠️  IMPORTANT: Add your Supabase credentials to .env:');
    console.log('');
    console.log('   👉 Step 1: Go to https://supabase.com');
    console.log('   👉 Step 2: Create a new project (takes 2 minutes)');
    console.log('   👉 Step 3: Go to Settings → API');
    console.log('   👉 Step 4: Copy URL and service_role key');
    console.log('   👉 Step 5: Add to .env file\n');
    console.log('   Required in .env:');
    console.log('   - SUPABASE_URL=https://your-project.supabase.co');
    console.log('   - SUPABASE_SERVICE_KEY=your-service-key-here\n');
  }
} else {
  console.log('ℹ️  .env file already exists');
  
  // Check if Supabase credentials are set
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('SUPABASE_URL=https://');
  const hasSupabaseKey = envContent.includes('SUPABASE_SERVICE_KEY=eyJ');
  
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.log('');
    console.log('⚠️  Missing Supabase credentials in .env!');
    console.log('   Add these to your .env file:');
    console.log('   - SUPABASE_URL');
    console.log('   - SUPABASE_SERVICE_KEY\n');
  } else {
    console.log('✅ Supabase credentials configured\n');
  }
}

// Create logs directory
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ Logs directory created');
}

console.log('\n🎉 Setup helper complete!\n');
