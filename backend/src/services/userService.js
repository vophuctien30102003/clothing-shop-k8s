const bcrypt = require("bcryptjs");
const { User } = require("../models/userModel");
const { sendVerificationEmail } = require("./emailService");
const {
    generateToken,
    generateEmailVerificationToken,
    verifyEmailVerificationToken,
} = require("../utils/jwt");

const UserService = {
    async create(payload) {
        const user = await User.create({
            email: payload.email,
            password_hash: payload.password_hash,
            verified: payload.verified ?? false,
            role: payload.role ?? "user",
            name: payload.name || null,
            phone: payload.phone || null,
        });

        return user.get({ plain: true });
    },

    async findByEmail(email) {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({
            where: { email: normalizedEmail },
        });
        return user ? user.get({ plain: true }) : null;
    },

    async findById(id) {
        const user = await User.findOne({
            where: { id },
        });
        return user ? user.get({ plain: true }) : null;
    },

    async setVerified(userId) {
        await User.update({ verified: true }, { where: { id: userId } });
    },

    async updatePassword(userId, passwordHash) {
        await User.update(
            { password_hash: passwordHash },
            { where: { id: userId } }
        );
    },

    async getProfile(userId) {
        const user = await User.findOne({
            where: { id: userId },
            attributes: ['id', 'email', 'name', 'phone', 'address', 'role', 'verified', 'created_at'],
        });
        return user ? user.get({ plain: true }) : null;
    },

    async updateProfile(userId, data) {
        const allowedFields = ['name', 'phone', 'address'];
        const updateData = {};
        
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            throw { status: 400, message: "Không có dữ liệu để cập nhật" };
        }

        await User.update(updateData, { where: { id: userId } });
        return await this.getProfile(userId);
    },

    async changePassword(userId, oldPassword, newPassword) {
        if (!oldPassword || !newPassword) {
            throw { status: 400, message: "Mật khẩu cũ và mật khẩu mới là bắt buộc" };
        }

        if (newPassword.length < 6) {
            throw { status: 400, message: "Mật khẩu mới phải có ít nhất 6 ký tự" };
        }

        const user = await User.findOne({
            where: { id: userId },
            attributes: ['id', 'password_hash'],
        });

        if (!user) {
            throw { status: 404, message: "User không tồn tại" };
        }

        const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isOldPasswordCorrect) {
            throw { status: 401, message: "Mật khẩu cũ không đúng" };
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await this.updatePassword(userId, newPasswordHash);

        return { message: "Đổi mật khẩu thành công" };
    },

    async registerStart({ email, password, name, phone }) {
        if (!email || !password) {
            throw { status: 400, message: "Email và password là bắt buộc" };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw { status: 400, message: "Email không hợp lệ" };
        }

        if (password.length < 6) {
            throw { status: 400, message: "Password phải có ít nhất 6 ký tự" };
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existing = await this.findByEmail(normalizedEmail);
        if (existing && existing.verified) {
            throw { status: 400, message: "Email đã tồn tại" };
        }

        const password_hash = await bcrypt.hash(password, 10);
        let user = existing;

        if (!existing) {
            user = await this.create({
                email: normalizedEmail,
                password_hash,
                role: "user",
                verified: false,
                name: name || null,
                phone: phone || null,
            });
        } else {
            await this.updatePassword(existing.id, password_hash);
            if (name || phone) {
                await User.update(
                    { name: name || existing.name, phone: phone || existing.phone },
                    { where: { id: existing.id } }
                );
            }
        }

        const verifyToken = generateEmailVerificationToken(normalizedEmail);
        const emailSent = await sendVerificationEmail(normalizedEmail, verifyToken);

        if (!emailSent) {
            throw { status: 500, message: "Không thể gửi email xác thực. Vui lòng thử lại sau." };
        }

        return { message: "Đã gửi email xác thực. Vui lòng kiểm tra hộp thư." };
    },

    async registerVerify({ token, email }) {
        if (!token) {
            throw { status: 400, message: "Token là bắt buộc" };
        }

        const decoded = verifyEmailVerificationToken(token);
        if (!decoded) {
            throw {
                status: 400,
                message: "Token không hợp lệ hoặc đã hết hạn",
            };
        }
        const targetEmail = (email || decoded.email).toLowerCase().trim();

        const user = await this.findByEmail(targetEmail);
        if (!user) {
            throw { status: 404, message: "User không tồn tại" };
        }

        if (user.verified) {
            return { message: "Email đã được xác thực trước đó" };
        }

        await this.setVerified(user.id);

        return { message: "Xác thực email thành công" };
    },

    async loginStart({ email, password }) {
        if (!email || !password) {
            throw { status: 400, message: "Email và password là bắt buộc" };
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await this.findByEmail(normalizedEmail);
        if (!user) {
            throw { status: 401, message: "Email hoặc password không đúng" };
        }

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            throw { status: 401, message: "Email hoặc password không đúng" };
        }
       
        if (!user.verified) {
            const verifyToken = generateEmailVerificationToken(normalizedEmail);
            const emailSent = await sendVerificationEmail(normalizedEmail, verifyToken);

            if (emailSent) {
                throw { 
                    status: 403, 
                    message: "Tài khoản chưa xác thực email. Đã gửi lại email xác thực, vui lòng kiểm tra hộp thư." 
                };
            } else {
                throw { 
                    status: 403, 
                    message: "Tài khoản chưa xác thực email. Không thể gửi email xác thực, vui lòng thử lại sau." 
                };
            }
        }

        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                verified: user.verified,
            },
        };
    },
};

module.exports = { UserService };
