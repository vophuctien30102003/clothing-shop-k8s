const jwt = require('jsonwebtoken');
const { config } = require('../config');

exports.generateToken = (payload) => {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch (error) {
        return null;
    }   
};

exports.generateEmailVerificationToken = (email) => {
    return jwt.sign({ email, purpose: 'verifyEmail' }, config.jwt.secret, {
        expiresIn: config.emailVerify.expiresIn,
    });
};

exports.verifyEmailVerificationToken = (token) => {
    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        if (decoded.purpose !== 'verifyEmail') return null;
        return decoded;
    } catch (error) {
        return null;
    }
};