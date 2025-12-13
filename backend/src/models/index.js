const { User } = require('./userModel');
const { Product } = require('./productModel');
const { Category } = require('./categoryModel');
const { Order } = require('./orderModel');
const { OrderItem } = require('./orderItemModel');

// Category - Product relationships
Category.hasMany(Product, {
    foreignKey: 'category_id',
    as: 'products',
});

Product.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category',
});

// User - Order relationships
User.hasMany(Order, {
    foreignKey: 'user_id',
    as: 'orders',
});

Order.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
});

// Order - OrderItem relationships
Order.hasMany(OrderItem, {
    foreignKey: 'order_id',
    as: 'orderItems',
});

OrderItem.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order',
});

// Product - OrderItem relationships
Product.hasMany(OrderItem, {
    foreignKey: 'product_id',
    as: 'orderItems',
});

OrderItem.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product',
});

module.exports = {
    User,
    Product,
    Category,
    Order,
    OrderItem,
};

