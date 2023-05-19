

module.exports = (db, type) => {
    return db.define('customers', {
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

        creator: {
            type: type.INTEGER
        },
        creation_date: {
            type: type.DATE
        },
        status:{
            type: type.ENUM('active', 'deleted')
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

        type: {
            type: type.ENUM('חברה','עובד חברה', 'לקוח רגיל', 'מוסד חינוכי', 'רשות', 'אחר')
        },
        role_id: {
            type: type.INTEGER
        }
    }, { timestamps: false, underscored: true })
} 
