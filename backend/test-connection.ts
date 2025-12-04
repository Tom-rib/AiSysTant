import pool from './src/config/database';
import redisClient from './src/config/redis';

async function test() {
  console.log('🔍 Testing connections...\n');

  // Test PostgreSQL
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL: Connected');
    console.log(`   Time: ${result.rows[0].now}\n`);
  } catch (error) {
    console.error('❌ PostgreSQL: Failed');
    console.error(`   Error: ${(error as any).message}\n`);
  }

  // Test PostgreSQL Users table
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Users table: Exists');
    console.log(`   Total users: ${result.rows[0].count}\n`);
  } catch (error) {
    console.error('❌ Users table: Failed');
    console.error(`   Error: ${(error as any).message}\n`);
  }

  // Test specific user
  try {
    const result = await pool.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      ['adminappli@aisystant.com']
    );
    if (result.rows.length > 0) {
      console.log('✅ Admin user found:');
      console.log(`   Email: ${result.rows[0].email}`);
      console.log(`   Role: ${result.rows[0].role}\n`);
    } else {
      console.log('⚠️  Admin user NOT found\n');
    }
  } catch (error) {
    console.error('❌ User lookup: Failed');
    console.error(`   Error: ${(error as any).message}\n`);
  }

  // Test Redis
  try {
    await redisClient.ping();
    console.log('✅ Redis: Connected\n');
  } catch (error) {
    console.error('❌ Redis: Failed');
    console.error(`   Error: ${(error as any).message}\n`);
  }

  console.log('Done!');
  process.exit(0);
}

test().catch(console.error);
