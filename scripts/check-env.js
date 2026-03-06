#!/usr/bin/env node

/**
 * Environment checker - Validates Supabase setup
 * Does NOT modify database architecture
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Panopticon Engine - Environment Check\n');

const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found');
  console.log('\nQuick setup:');
  console.log('  1. Copy .env.example to .env');
  console.log('  2. Add your Supabase credentials');
  console.log('  3. Add a JWT_SECRET\n');
  console.log('See QUICKSTART.md for detailed instructions\n');
  return;
}

// Check for required variables
const envContent = fs.readFileSync(envPath, 'utf-8');
const hasSupabaseUrl = envContent.includes('SUPABASE_URL=') && !envContent.includes('SUPABASE_URL=https://your-project');
const hasSupabaseKey = envContent.includes('SUPABASE_SERVICE_KEY=') && !envContent.includes('SUPABASE_SERVICE_KEY=your');
const hasJwtSecret = envContent.includes('JWT_SECRET=') && !envContent.includes('JWT_SECRET=your');

console.log('Environment check:');
console.log(hasSupabaseUrl ? '  ✅ SUPABASE_URL configured' : '  ❌ SUPABASE_URL missing or placeholder');
console.log(hasSupabaseKey ? '  ✅ SUPABASE_SERVICE_KEY configured' : '  ❌ SUPABASE_SERVICE_KEY missing or placeholder');
console.log(hasJwtSecret ? '  ✅ JWT_SECRET configured' : '  ❌ JWT_SECRET missing or placeholder');

if (!hasSupabaseUrl || !hasSupabaseKey || !hasJwtSecret) {
  console.log('\n⚠️  Please configure required variables in .env');
  console.log('See QUICKSTART.md for setup instructions\n');
} else {
  console.log('\n✅ All required variables configured!\n');
}
