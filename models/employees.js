

module.exports = (db, type) => {
    return db.define('employees', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        first_name: {
            type: type.STRING(100)
        },
        last_name: {
            type: type.STRING(50)
        },
        phone: {
            type: type.STRING(10)
        },
        identity: {
            type: type.STRING(9)
        },
        status: {
            type: type.ENUM('active', 'deleted')
        },
        email: {
            type: type.STRING(100)
        },
        password: {
            type: type.TEXT
        },
        city: {
            type: type.STRING(100)
        },
        street: {
            type: type.STRING(50)
        },
        postal_code: {
            type: type.STRING(9)
        },
        role_id: {
            type: type.INTEGER
        }
    }, { timestamps: false, underscored: true })
} 
