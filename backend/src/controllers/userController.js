const { UserService } = require("../services/userService");

exports.register = async (req, res) => {
    try {
        const result = await UserService.registerStart(req.body);
        res.status(201).json(result);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ message: error.message || "Internal server error" });
    }
};

exports.login = async (req, res) => {
    try {
        const result = await UserService.loginStart(req.body);
        res.status(200).json(result);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ message: error.message || "Internal server error" });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        // Hỗ trợ cả GET (query) và POST (body) cho token
        const token = req.query.token || req.body.token;
        const email = req.query.email || req.body.email;
        
        const result = await UserService.registerVerify({ token, email });
        res.status(200).json(result);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ message: error.message || "Internal server error" });
    }
};

exports.forgotPassword = async (req, res) => {
    res.status(501).json({ message: "Not implemented" });
};

exports.resetPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        const result = await UserService.changePassword(userId, oldPassword, newPassword);
        res.status(200).json(result);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ message: error.message || "Internal server error" });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await UserService.getProfile(userId);

        if (!profile) {
            return res.status(404).json({ message: "Không tìm thấy thông tin người dùng" });
        }

        res.status(200).json(profile);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ message: error.message || "Internal server error" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await UserService.updateProfile(userId, req.body);
        res.status(200).json(result);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ message: error.message || "Internal server error" });
    }
};

exports.listUsers = async (req, res) => {
    res.status(501).json({ message: "Not implemented" });
};

exports.updateUserRole = async (req, res) => {
    res.status(501).json({ message: "Not implemented" });
};
