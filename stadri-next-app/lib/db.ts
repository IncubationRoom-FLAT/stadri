import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mydb',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || '',
});

export default pool;
