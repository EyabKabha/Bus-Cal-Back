
module.exports = (db, type) => {
    return db.define('cities', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: type.STRING(150)
        }
    }, { timestamps: false, underscored: true})
} 
