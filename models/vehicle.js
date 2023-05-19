

module.exports = (db, type) => {
    return db.define('vehicle', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        type_id: {
            type: type.INTEGER
        },
        capacity: {
            type: type.INTEGER
        }
    }, { timestamps: false, underscored: true })
} 
