
module.exports = (db, type) => {
    return db.define('closed_available_vehicles', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        available_vehicle_id: {
            type: type.INTEGER
        },
        company_id: {
            type: type.INTEGER
        },
        customer_id: {
            type: type.INTEGER
        },
        user_company_id: {
            type: type.INTEGER
        },
        customer_company_id: {
            type: type.INTEGER
        }
    }, { timestamps: false, underscored: true })
} 
