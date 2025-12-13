require("dotenv").config();
const { app } = require("./app");
const { sequelize } = require("./config/database");
const { config } = require("./config");
// Khởi tạo models
require("./models/userModel");

async function start() {
    try {
        await sequelize.authenticate();
        console.log("DB connected successfully");
        
        if (config.env === 'development') {
            await sequelize.sync({ alter: true }); 
            console.log("Models synced with database");
        }
    } catch (err) {
        console.error("DB connection failed:", err.message);
        process.exit(1);
    }

    app.listen(config.port, () => {
        console.log(`Backend server running on port http://localhost:${config.port}`);
    });
}

start();
