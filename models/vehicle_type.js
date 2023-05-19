

module.exports = (db, type) => {
    return db.define('vehicle_type', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        type: {
            type: type.STRING(50)
        }
    }, { timestamps: false, underscored: true })
} 
