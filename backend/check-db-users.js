require('dotenv').config();
const { Pool } = require('pg');

// First try to connect as a superuser or with a working user to check available users
async function checkDatabaseUsers() {
  // Try different common superuser accounts
  const tryUsers = [
    { user: 'postgres', password: 'postgres' },
    { user: 'postgres', password: 'password' },
    { user: 'postgres', password: 'admin' },
    { user: 'postgres', password: '' },
    { user: 'postgre_db', password: 'pass123' }, // Your current config
  ];

  for (const credentials of tryUsers) {
    try {
      console.log(`🔍 Trying to connect with user: ${credentials.user}`);
      
      const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: 'postgres', // Connect to default postgres database first
        user: credentials.user,
        password: credentials.password,
      });

      const client = await pool.connect();
      console.log(`✅ Connected successfully with user: ${credentials.user}`);
      
      // Check available databases
      console.log('\n📊 Available databases:');
      const databases = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
      databases.rows.forEach(db => console.log(`  - ${db.datname}`));
      
      // Check available users/roles
      console.log('\n👥 Available database users/roles:');
      const users = await client.query(`
        SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolcanlogin 
        FROM pg_roles 
        WHERE rolcanlogin = true
        ORDER BY rolname;
      `);
      
      users.rows.forEach(user => {
        console.log(`  - ${user.rolname} (Super: ${user.rolsuper}, CanLogin: ${user.rolcanlogin})`);
      });
      
      // Try to connect to wms database if it exists
      const wmsExists = databases.rows.some(db => db.datname === 'wms');
      if (wmsExists) {
        console.log('\n🎯 WMS database exists! Checking tables...');
        
        const wmsPool = new Pool({
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          database: 'wms',
          user: credentials.user,
          password: credentials.password,
        });
        
        try {
          const wmsClient = await wmsPool.connect();
          
          // Check tables in wms database
          const tables = await wmsClient.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
          `);
          
          console.log('📋 Tables in WMS database:');
          tables.rows.forEach(table => console.log(`  - ${table.table_name}`));
          
          wmsClient.release();
          await wmsPool.end();
        } catch (wmsError) {
          console.log(`❌ Cannot access WMS database: ${wmsError.message}`);
        }
      } else {
        console.log('❌ WMS database does not exist');
      }
      
      client.release();
      await pool.end();
      break; // Exit loop if successful connection
      
    } catch (error) {
      console.log(`❌ Failed to connect with ${credentials.user}: ${error.message}`);
      continue; // Try next user
    }
  }
}

checkDatabaseUsers().catch(console.error);
