

module.exports = (db, type) => {
    return db.define('roles', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: type.STRING(50)
        }
    }, { timestamps: false, underscored: true })
} 
