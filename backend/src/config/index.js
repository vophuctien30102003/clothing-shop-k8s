require('dotenv').config();

const config = {
    env: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 3000,
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'clothing_shop',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'change-this-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    email: {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM || 'noreply@example.com',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    },
    emailVerify: {
        expiresIn: process.env.EMAIL_VERIFY_EXPIRES_IN || '24h',
    },
};

module.exports = { config };

