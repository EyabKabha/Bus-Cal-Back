

module.exports = (db, type) => {
    return db.define('trip', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        type: {
            type: type.STRING(45)
        }
    }, { timestamps: false, underscored: true})
} 
