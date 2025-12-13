const nodemailer = require('nodemailer');
const { config } = require('../config');

const hasEmailConfig = config.email.host && config.email.user && config.email.pass;
const isLocalhost = config.email.host && (
    config.email.host === 'localhost' || 
    config.email.host === '127.0.0.1' || 
    config.email.host.startsWith('127.')
);

let transporter = null;

if (hasEmailConfig && !isLocalhost) {
    const cleanPassword = config.email.pass ? config.email.pass.replace(/\s/g, '') : '';
    
    transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
        secure: config.email.port === 465,
    auth: {
        user: config.email.user,
            pass: cleanPassword,
    },
});
} else {
    if (isLocalhost) {
        console.warn('⚠️  EMAIL_HOST is set to localhost. Email service will run in development mode.');
    } else {
        console.warn('⚠️  Email configuration missing. Email service will be disabled.');
    }
}

exports.sendVerificationEmail = async (email, token) => {
    const link = `${config.email.frontendUrl}/verify-email?token=${token}`;

    const mailOptions = {
        from: config.email.from,
        to: email,
        subject: '[Clothing Shop] Xác thực email đăng ký',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Chào mừng đến với Clothing Shop!</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào,</p>
                        <p>Cảm ơn bạn đã đăng ký tài khoản tại Clothing Shop.</p>
                        <p>Vui lòng click vào nút bên dưới để xác thực email của bạn:</p>
                        <div style="text-align: center;">
                            <a href="${link}" class="button">Xác thực email</a>
                        </div>
                        <p>Hoặc copy và dán link sau vào trình duyệt:</p>
                        <p style="word-break: break-all; color: #0066cc;">${link}</p>
                        <p><strong>Lưu ý:</strong> Link này sẽ hết hạn sau ${config.emailVerify.expiresIn}.</p>
                        <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Clothing Shop. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
            Chào mừng đến với Clothing Shop!
            
            Cảm ơn bạn đã đăng ký tài khoản. Vui lòng click vào link sau để xác thực email:
            ${link}
            
            Link này sẽ hết hạn sau ${config.emailVerify.expiresIn}.
            
            Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
        `,
    };

    if (!hasEmailConfig || isLocalhost) {
        if (config.env === 'development') {
            console.log(`\n📧 Development Mode - Verification Link: ${link}`);
        }
        return true;
    }

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error.message);
        
        if (error.code === 'EAUTH' || error.message.includes('Invalid login') || error.message.includes('BadCredentials')) {
            console.error('Gmail authentication failed. Please check your App Password configuration.');
        }
        
        return false;
    }
};
