const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const db = new Database('./quickpoll.db');

// Create a test user
const testUserId = randomUUID();
const testEmail = 'test@tinyengage.com';
const testPassword = 'password123';
const hashedPassword = bcrypt.hashSync(testPassword, 12);

console.log('Creating test user...');
try {
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, name, password_hash, subscription_tier)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  insertUser.run(testUserId, testEmail, 'Test User', hashedPassword, 'free');
  
  console.log(`Test user created:
    Email: ${testEmail}
    Password: ${testPassword}
    ID: ${testUserId}`);
} catch (error) {
  if (error.message.includes('UNIQUE constraint failed')) {
    console.log('Test user already exists');
  } else {
    console.error('Error creating test user:', error);
  }
}

db.close();
console.log('Test setup complete!');