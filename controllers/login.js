const { customers, employees, roles, companies } = require('../models')
const { encrypt } = require("./encrypt")
const { loginValidation } = require('../middleware/validations');
const { BuscalError } = require('../models/Errors');
const { sendEmail } = require('./sendEmail')
const { sendSingleSMS, sendForAll} = require('./sendSMS')

const employeesLogin = async (userDetails) => {
    try {
        const validationResult = await Joi.validate(userDetails, loginValidation);
        if (!validationResult)
            throw new BuscalError(`Validation Error: ${validationResult}`)

        const employee = await employees.findOne({
            attributes: ['id', 'first_name', 'last_name'],
            include: [{ model: roles }],
            where: {
                email: userDetails.email,
                password: encrypt(userDetails.password),
                status: 'active'
            }
        })

        if (employee) return employee
        throw new BuscalError(`שם משתמש או סיסמה לא נכונים`)

    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't login: ${err.message}`)
    }

}

const customersLogin = async (userDetails) => {
    try {
        const validationResult = await Joi.validate(userDetails, loginValidation);
        if (!validationResult)
            throw new BuscalError(`Validation Error: ${validationResult}`)

        const customer = await customers.findOne({
            attributes: ['id', 'first_name', 'last_name'],
            include: [{ model: roles }],
            where: {
                email: userDetails.email,
                password: encrypt(userDetails.password),
                status: 'active'
            }
        })
        if (customer) return customer
        throw new BuscalError('שם משתמש או סיסמה לא נכונים')

    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't login: ${err.message}`)
    }

}


const resetPassword = async (email) => {

    try {
        const customerExist = await customers.findOne({ where: { email: email, status: 'active' } })

        if (customerExist) {
            const code = Math.random().toString(36).slice(-8)
           //sendEmail(email, `<h2>Your Buscal verification code is: ${code}.<br>Please do not share this code with anyone.<h2>`, "שחזור סיסמה")
           sendEmail(email, `<h2 dir="rtl">שלום<br> נשלח לך קוד לשחזור סיסמה:<br><h3>Code: ${code}</h3></h2>`, "שחזור סיסמה") 
           const msg = ` אימיל נשלח לכתובת ${email} לשחזור סיסמה `
            return {
                msg,
                code
            }
        }

        throw new BuscalError(`משתמש לא נמצא`)
    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`User not found: ${err.message}`)

    }
}

const updatePassword = async (userDetails) => {

    try {
        // const validationResult = await Joi.validate(userDetails, loginValidation);
        // if (!validationResult) {
        //     return 'data not valid '+validationResult;
        // }
        const customerExist = await customers.findOne({ where: { email: userDetails.email, status: 'active' } })

        if (customerExist) {
            customers.update({
                password: encrypt(userDetails.password)
            },
                { where: { email: userDetails.email } }
            )
            return "סיסמה עודכנה בהצלחה"
        }

        throw new BuscalError(`אימייל לא קיים`)
    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Email not found: ${err.message}`)
    }
}

module.exports = {
    employeesLogin,
    customersLogin,
    resetPassword,
    updatePassword
}