

module.exports = (db, type) => {
    return db.define('waiting_customers', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        first_name: {
            type: type.STRING(50)
        },
        last_name: {
            type: type.STRING(50)
        },
        fax: {
            type: type.STRING(11)
        },
        phone: {
            type: type.STRING(10)
        },
        email: {
            type: type.STRING(100)
        },
        password: {
            type: type.TEXT
        },
        email_notification: {
            type: type.TINYINT(1)
        },
        sms_notification: {
            type: type.TINYINT(1)
        },
        creation_date: {
            type: type.DATE
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
        company_name: {
            type: type.STRING(100)
        },
        company_phone: {
            type: type.STRING(10)
        },
        company_t_phone: {
            type: type.STRING(10)
        },
        company_email: {
            type: type.STRING(100)
        },
        code: {
            type: type.STRING(9)
        },
        company_fax: {
            type: type.STRING(11)
        },
        company_city: {
            type: type.STRING(100)
        },
        company_street: {
            type: type.STRING(100)
        },
        company_postal_code: {
            type: type.STRING(100)
        },
        subscription: {
            type: type.ENUM('vip', 'regular')
        },
        company_type: {
            type: type.ENUM('חברה', 'עוסק מורשה')
        }
    }, { timestamps: false, underscored: true })
} 
