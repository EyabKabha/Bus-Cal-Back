



module.exports = (db, type) => {
    return db.define('stop_stations_orders', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        station: {
            type: type.STRING(50)
        },
        order_id: {
            type: type.INTEGER
        },
        sequence: {
            type: type.INTEGER
        }
    }, { timestamps: false, underscored: true })
} 
