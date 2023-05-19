


module.exports = (db, type) => {
    return db.define('extra_orders', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        extra_id: {
            type: type.INTEGER
        },
        order_id: {
            type: type.INTEGER
        }
    }, { timestamps: false, underscored: true })
} 
