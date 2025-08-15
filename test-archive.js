const jwt = require('jsonwebtoken');

// Generate a test JWT token (same as in auth.ts)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production';

const payload = {
  userId: '6550c360-f81b-4708-ace9-79ddb559a87c', // Test user ID from test-setup
  email: 'test@tinyengage.com'
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

console.log('🔑 Test JWT Token:');
console.log(token);
console.log('\n📋 Test Commands:');
console.log('\n1. List active surveys:');
console.log(`curl -H "Authorization: Bearer ${token}" "http://localhost:3001/api/surveys"`);
console.log('\n2. Archive first survey:');
console.log(`curl -X PATCH -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '{"archived": true}' "http://localhost:3001/api/surveys/51f45724-3cd9-4918-b62b-73f0695d1bfa/archive"`);
console.log('\n3. List archived surveys:');
console.log(`curl -H "Authorization: Bearer ${token}" "http://localhost:3001/api/surveys?archivedOnly=true"`);
console.log('\n4. Unarchive survey:');
console.log(`curl -X PATCH -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '{"archived": false}' "http://localhost:3001/api/surveys/51f45724-3cd9-4918-b62b-73f0695d1bfa/archive"`);