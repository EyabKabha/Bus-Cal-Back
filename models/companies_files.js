
module.exports = (db, type) => {
    return db.define('companies_files', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        path: {
            type: type.TEXT
        },
        company_id: {
            type: type.INTEGER
        }
    }, { timestamps: false, underscored: true })
} 
