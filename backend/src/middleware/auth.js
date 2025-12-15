const { verifyToken } = require('../utils/jwt');
const { UserService } = require('../services/userService');

const authenticateLogin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token không được cung cấp' });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }

        const user = await UserService.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            verified: user.verified,
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Lỗi xác thực' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Chưa xác thực' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        next();
    };
};

const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }

    try {
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (decoded) {
            const user = await UserService.findById(decoded.userId);
            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    verified: user.verified,
                };
            }
        }
    } catch (error) {
    }
    next();
};

module.exports = { authenticateLogin, authorize, optionalAuth };
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        