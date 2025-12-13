const { Sequelize } = require('sequelize');
const { config } = require('./index');

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: false,
    define: {
        underscored: true,
        timestamps: false,
    },
});

module.exports = { sequelize };