require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkUsers() {
  try {
    console.log('🔍 Connecting to database...');
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to database successfully!');
    
    // Check if users table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Users table does not exist');
      console.log('Available tables:');
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    } else {
      console.log('✅ Users table exists');
      
      // Get users count
      const countResult = await client.query('SELECT COUNT(*) FROM users');
      console.log(`📊 Total users: ${countResult.rows[0].count}`);
      
      // First, check the actual column structure
      console.log('\n🏗️  Users table structure:');
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `);
      columns.rows.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));
      
      // Get all users with dynamic column selection
      console.log('\n👥 Users in database:');
      const usersResult = await client.query('SELECT * FROM users ORDER BY id LIMIT 10');
      
      if (usersResult.rows.length > 0) {
        usersResult.rows.forEach((user, index) => {
          console.log(`\n  User ${index + 1}:`);
          Object.keys(user).forEach(key => {
            if (key !== 'password') { // Don't show password
              console.log(`    ${key}: ${user[key]}`);
            }
          });
        });
      } else {
        console.log('📭 No users found in database');
      }
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    if (error.code === '28P01') {
      console.error('💡 This looks like an authentication error. Please check your database credentials in .env file');
    }
  } finally {
    await pool.end();
  }
}

checkUsers();
