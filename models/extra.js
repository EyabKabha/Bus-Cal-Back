

module.exports = (db, type) => {
    return db.define('extra', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: type.ENUM('מדריך', 'מלווה', 'חובש', 'מעלון', 'wifi')
        }
    }, { timestamps: false, underscored: true})
} 
