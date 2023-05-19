const { customers, companies, customers_companies, roles, waiting_customers, companies_files, waiting_files } = require('../models')
const { encrypt } = require("./encrypt")
const { Op } = require("sequelize");
const { sendEmail } = require('./sendEmail')
const { customerValidation, companiesValidation, customerCompanyValidation } = require('../middleware/validations');
const { BuscalError } = require('../models/Errors');
const { sendSingleSMS } = require('./sendSMS')

const signUp = async (userDetails, userId) => {
    try {

        const customerIsExist = await customers.findOne({
            where: {
                [Op.or]: [
                    { phone: userDetails.phone },
                    { email: userDetails.email }
                ]
            }
        })

        if (customerIsExist) throw new BuscalError("אחד או יותר מהפרטים שהזנת שייכים ללקוח אחר")

        else {

            if (userDetails.type === 'חברה') {

                const role = await roles.findOne({
                    where: {
                        name: 'adminCompany'
                    }
                })

                const CompanyisExist = await companies.findOne({
                    where: {
                        [Op.or]: [
                            { name: userDetails.companyname },
                            { t_phone: userDetails.company_t_phone },
                            { phone: userDetails.companyphone },
                            { email: userDetails.companyemail }
                        ]
                    }
                })

                if (CompanyisExist)
                    throw new BuscalError("אחד או יותר מהפרטים שהזנת שייכים לחברה אחרת")

                // const validationResult2 = await Joi.validate(userDetails, customerCompanyValidation);
                // if (!validationResult2) {
                //     return 'data not valid '+result;
                // }
                const customer = await customers.create({
                    first_name: userDetails.first_name,
                    last_name: userDetails.last_name,
                    fax: userDetails.fax,
                    phone: userDetails.phone,
                    email: userDetails.email,
                    password: encrypt(userDetails.password),
                    city: userDetails.city,
                    street: userDetails.street,
                    postal_code: userDetails.postal_code,
                    type: userDetails.type,
                    creator: userId,
                    creation_date: new Date(),
                    email_notification: userDetails.email_notification,
                    sms_notification: userDetails.sms_notification,
                    role_id: role.dataValues.id
                })

                const company = await companies.create({
                    name: userDetails.companyname,
                    phone: userDetails.companyphone,
                    t_phone: userDetails.company_t_phone,
                    email: userDetails.companyemail,
                    code: userDetails.code,
                    fax: userDetails.companyfax,
                    city: userDetails.companycity,
                    street: userDetails.companystreet,
                    postal_code: userDetails.company_postal_code,
                    subscription: userDetails.subscription,
                    type: userDetails.company_type
                })

                await customers_companies.create({
                    customer_id: customer.dataValues.id,
                    company_id: company.dataValues.id,
                })
                return company.id
            }


            else {

                const role = await roles.findOne({
                    where: {
                        name: 'customer'
                    }
                })
                // const validationResult3 = await Joi.validate(userDetails, customerValidation);
                // if (!validationResult3) {
                //     return 'data not valid '+validationResult3;
                // }
                await customers.create({
                    first_name: userDetails.first_name,
                    last_name: userDetails.last_name,
                    fax: userDetails.fax,
                    phone: userDetails.phone,
                    email: userDetails.email,
                    password: encrypt(userDetails.password),
                    city: userDetails.city,
                    street: userDetails.street,
                    postal_code: userDetails.postal_code,
                    type: userDetails.type,
                    creator: userId,
                    creation_date: new Date(),
                    email_notification: userDetails.email_notification,
                    sms_notification: 0,
                    role_id: role.dataValues.id
                })

            }

        }

        return "נוצר בהצלחה"

    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't login: ${err.message}`)
    }

}

const SignUpWait = async (userDetails) => {
    try {

        const customerIsExist = await customers.findOne({
            where: {
                [Op.or]: [
                    { phone: userDetails.phone },
                    { email: userDetails.email }
                ]
            }
        })
        if (customerIsExist) throw new BuscalError("אחד או יותר מהפרטים שהזנת שייכים ללקוח אחר")

        const waitingCustomerIsExist = await waiting_customers.findOne({
            where: {
                [Op.or]: [
                    { phone: userDetails.phone },
                    { email: userDetails.email }
                ]
            }
        })
        if (waitingCustomerIsExist) throw new BuscalError("אתה רשום במערכת, אנא חכה לבדיקת הפרטים שלך")

        const CompanyisExist = await companies.findOne({
            where: {
                [Op.or]: [
                    { name: userDetails.companyname },
                    { t_phone: userDetails.company_t_phone },
                    { phone: userDetails.companyphone },
                    { email: userDetails.companyemail }
                ]
            }
        })

        if (CompanyisExist)
            throw new BuscalError("אחד או יותר מהפרטים שהזנת שייכים לחברה אחרת")


        const waitingCompanyisExist = await waiting_customers.findOne({
            where: {
                [Op.or]: [
                    { company_name: userDetails.companyname },
                    { company_t_phone: userDetails.company_t_phone },
                    { company_phone: userDetails.companyphone },
                    { company_email: userDetails.companyemail }
                ]
            }
        })

        if (waitingCompanyisExist)
            throw new BuscalError("אתה רשום במערכת, אנא חכה לבדיקת הפרטים שלך")

        // const validationResult2 = await Joi.validate(userDetails, customerCompanyValidation);
        // if (!validationResult2) {
        //     return 'data not valid '+result;
        // }
        const newCustomer = await waiting_customers.create({
            first_name: userDetails.first_name,
            last_name: userDetails.last_name,
            fax: userDetails.fax,
            phone: userDetails.phone,
            email: userDetails.email,
            password: encrypt(userDetails.password),
            city: userDetails.city,
            street: userDetails.street,
            postal_code: userDetails.postal_code,
            creation_date: new Date(),
            email_notification: userDetails.email_notification,
            sms_notification: userDetails.sms_notification,
            company_name: userDetails.companyname,
            company_phone: userDetails.companyphone,
            company_t_phone: userDetails.company_t_phone,
            company_email: userDetails.companyemail,
            code: userDetails.code,
            company_fax: userDetails.companyfax,
            company_city: userDetails.companycity,
            company_street: userDetails.companystreet,
            company_postal_code: userDetails.company_postal_code,
            subscription: userDetails.subscription,
            company_type: userDetails.company_type

        })
        
        return newCustomer.id

    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't create waiting customer.${err.message}`)
    }
}

const confirmSignUp = async (userId) => {
    try {
        const role = await roles.findOne({
            where: {
                name: 'adminCompany'
            }
        })

        const userDetails = await waiting_customers.findOne({ where: { id: userId } })
        if (!userDetails) throw new BuscalError("חייב לצפות בפרטי הלקוח לפני האישור")

        const customer = await customers.create({
            first_name: userDetails.first_name,
            last_name: userDetails.last_name,
            fax: userDetails.fax,
            phone: userDetails.phone,
            email: userDetails.email,
            password: userDetails.password,
            city: userDetails.city,
            street: userDetails.street,
            postal_code: userDetails.postal_code,
            type: 'חברה',
            creator: 0,
            creation_date: userDetails.creation_date,
            email_notification: userDetails.email_notification,
            sms_notification: userDetails.sms_notification,
            role_id: role.dataValues.id
        })

        const company = await companies.create({
            name: userDetails.company_name,
            phone: userDetails.company_phone,
            t_phone: userDetails.company_t_phone,
            email: userDetails.company_email,
            code: userDetails.code,
            fax: userDetails.company_fax,
            city: userDetails.company_city,
            street: userDetails.company_street,
            postal_code: userDetails.company_postal_code,
            subscription: userDetails.subscription,
            type: userDetails.company_type
        })

        await customers_companies.create({
            customer_id: customer.dataValues.id,
            company_id: company.dataValues.id,
        })


        const userFiles = await waiting_files.findAll({ where: { company_id: userId } });
        userFiles.map(async (file) => {
            await companies_files.create({
                path: file.path,
                company_id: company.dataValues.id
            });

        })
        sendEmail(userDetails.email, `<h2 dir="rtl">שלום<br> הפרטים שלך נקלטו בהצלחה במערכת, אתה יכול להנות מכל השירותים שלנו<br><h3></h3></h2>`, "הרשמה במערכת")
        
        await waiting_files.destroy({ where: { company_id: userId } })

        await waiting_customers.destroy({ where: { id: userDetails.id } })


        return "נרשם בהצלחה"

    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't confirm customer.${err.message}`)
    }
}

const refuseSignUp = async (userId) => {
    try {

        const userDetails = await waiting_customers.destroy({ where: { id: userId } })
        if (!userDetails) throw new BuscalError("לקוח לא נמצא")

        await waiting_files.destroy({ where: { company_id: userId } })


        return "נמחק בהצלחה"

    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't delete customer.${err.message}`)
    }
}

const confirmEmail = (email) => {
    try {
        const code = Math.random().toString(36).slice(-8)
        sendEmail(email, `<h2 dir="rtl">שלום<br> קוד האימות לכתובת הדואר האלקטרוני:<br><h3>Code: ${code}</h3></h2>`, "אשר אימייל")
        return code
    } catch (err) {
        throw new Error(`Can't send email: ${err.message}`)
    }
}

const confirmPhone = (phone) => {
    try {
        const code = Math.floor(
            Math.random() * (9000 - 1000) + 1000 
            )
        sendSingleSMS(phone, `קוד האימות שלך הוא: ${code}`)
        return code
    } catch (err) {
        throw new Error(`Can't send email: ${err.message}`)
    }
}

const loadWaitingFiles = async (id) => {
    try {
        let files = await waiting_files.findAll({
            where: { company_id: id }
        });
        return files;

    } catch (err) {
        throw new Error(`Can't load files: ${err.message}`)
    }
}

module.exports = {
    signUp,
    confirmEmail,
    SignUpWait,
    confirmSignUp,
    refuseSignUp,
    loadWaitingFiles,
    confirmPhone
}