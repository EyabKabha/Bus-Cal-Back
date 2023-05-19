

module.exports = (db, type) => {
    return db.define('companies', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: type.STRING(50)
        },
        phone: {
            type: type.STRING(10)
        },
        t_phone: {
            type: type.STRING(10)
        },
        email: {
            type: type.STRING(100)
        },
        status:{
            type: type.ENUM('active', 'deleted')
        },
        code: {
            type: type.STRING(9)
        },
        fax: {
            type: type.STRING(11)
        },
        city: {
            type: type.STRING(100)
        },
        street: {
            type: type.STRING(50)
        },
        postal_code: {
            type: type.STRING(10)
        },
        subscription: {
            type: type.ENUM('vip', 'regular')
        },
        type: {
            type: type.ENUM('חברה', 'עוסק מורשה')
        }

    }, { timestamps: false, underscored: true })
} 
