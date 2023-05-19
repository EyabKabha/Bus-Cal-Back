
module.exports = (db, type) => {
    return db.define('employee_files', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        path: {
            type: type.TEXT
        },
        employee_id: {
            type: type.INTEGER
        }
    }, { timestamps: false, underscored: true })
} 
