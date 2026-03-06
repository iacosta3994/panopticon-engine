#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('\n🚀 Panopticon Engine - Auto Setup\n');

// Create .env if it doesn't exist
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  // Generate random JWT secret
  const jwtSecret = crypto.randomBytes(32).toString('base64');
  
  const envContent = `# Auto-generated on ${new Date().toISOString()}\n\n# JWT Secret (Auto-generated)\nJWT_SECRET=${jwtSecret}\n\n# Everything else uses smart defaults!\n# Add optional integrations below as needed:\n\n# Email (Optional)\n# SMTP_USER=your-email@gmail.com\n# SMTP_PASSWORD=your-app-password\n\n# Telegram (Optional)\n# TELEGRAM_BOT_TOKEN=your-bot-token\n# TELEGRAM_CHAT_ID=your-chat-id\n`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created with auto-generated JWT_SECRET\n');
} else {
  console.log('ℹ️  .env file already exists\n');
}

// Create data directory for SQLite
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Data directory created\n');
}

// Create logs directory
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ Logs directory created\n');
}

console.log('🎉 Setup complete! The system is ready to use.\n');
console.log('Next steps:');
console.log('  1. npm run dev    (start development server)');
console.log('  2. npm run build  (build for production)');
console.log('  3. npm start      (start production server)\n');
