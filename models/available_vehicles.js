

module.exports = (db, type) => {
    return db.define('available_vehicles', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        encrypted_id:{
            type: type.STRING(45)
        },
        customer_id: {
            type: type.INTEGER
        },
        company_id: {
            type: type.INTEGER
        },
        vehicle_id: {
            type: type.INTEGER
        },
        start_date: {
            type: type.DATE
        },
        end_date: {
            type: type.DATE
        },
        start_hour: {
            type: type.TIME
        },
        end_hour: {
            type: type.TIME
        },
        description: {
            type: type.TEXT
        },
        active: {
            type: type.TINYINT(1)
        },
        expired: {
            type: type.TINYINT(1)
        }
    }, { timestamps: false, underscored: true })
} 