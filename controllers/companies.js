const { orders, customers_companies, customers, companies, companies_files, waiting_files } = require('../models')
const { closed_orders } = require('../models/index')
const { Op } = require("sequelize");
const { encrypt } = require("./encrypt")
const { BuscalError } = require('../models/Errors');
const { sendEmail } = require('./sendEmail')


const loadCompanyFiles = async (id) => {
    try {
        let files = await companies_files.findAll({
            where: { company_id: id }
        });
        return files;
    } catch (err) {
        throw new Error(`Can't load files: ${err.message}`)
    }
}

const loadWaitingCompanyFiles = async (id) => {
    try {
        let files = await waiting_files.findAll({
            where: { company_id: id }
        });
        files = files.map((file) => file.path);
        return files;
    } catch (err) {
        throw new Error(`Can't load files: ${err.message}`)
    }
}

const uploadCompanyFiles = async (files, id) => {
    try {
        files.map(async (file) => {
            await waiting_files.create({
                path: file.location,
                company_id: id
            });
        })
        return 'Successfully files added and waiting for admin permession'
    } catch (err) {
        throw new Error(`Can't add files: ${err.message}`)
    }
}

const directUploadCompanyFiles = async (files, id) => {
    try {
        files.map(async (file) => {
            await companies_files.create({
                path: file.location,
                company_id: id
            });
        })
        return 'Successfully files added'
    } catch (err) {
        throw new Error(`Can't add files: ${err.message}`)
    }
}


const summary = async (sum, userId) => {

    try {

        const order = await orders.findOne({
            where: { encrypted_id: sum.serial_number, active: 1 }
        })
        
        if (!order) throw new BuscalError("הזמנה לא נמצאת או נשלפה כבר")
        
        const userCompany = await customers_companies.findOne({ where: { customer_id: userId } })
        if (!userCompany) throw new BuscalError('לקוח לא קיים')

        const comp = await companies.findOne({ where: { id: userCompany.company_id } })

        await orders.update({
            active: 0
        },
            { returning: true, where: { id: sum.order_id } }
        )

        await closed_orders.create({
            company_id: userCompany.company_id, // // company that took the order
            user_company_id: userId, // userCompany that took the av
            customer_id: order.customer_id, // // customer that owner the order
            order_id: sum.order_id
        })

        //sendEmail
        sendEmail(sum.customerEmail,`<h2 dir="rtl">שלום<br> ההזמנה שלך מספר : ${sum.serial_number} נשלפה ע"י חברת ${comp.name}<br>הערה: ${sum.description}.<br>מחיר: ${sum.price}<br><h3></h3></h2>`, "הזמנה נשלפה")
        return "הזמנה נשלפה"


    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't send summary: ${err.message}`)

    }
}

const getCompanyEmployees = async (query, userId) => {
    try {
        let adminCompany = await customers_companies.findOne({
            where: { customer_id: userId },
        });

        let allEmployees = await companies.findOne({
            include: [{
                model: customers,
                attributes: ['first_name', 'last_name', 'id'],
                where: {
                    [Op.not]: [{ id: userId }],
                }
            }
            ],
            where: { id: adminCompany.company_id },
            offset: (parseInt(query.page) - 1) * parseInt(query.size),
            limit: parseInt(query.size) + 1,
        });

        let hasNext = false, hasPrev = false, res;
        if (!allEmployees){
            allEmployees = []
             return { allEmployees, hasNext, hasPrev }
            }

        allEmployees = allEmployees.customers.map((emp) => {
            return {
                name: emp.first_name + ' ' + emp.last_name,
                id: emp.id
            }
        })
        
    if (allEmployees.length > query.size) {
      hasNext = true;
      allEmployees = allEmployees.slice(0, query.size);
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    return { allEmployees, hasNext, hasPrev };

    } catch (error) {
        throw new Error(`Can't get employees: ${error.message}`);
    }


}


//deleteCustomer
const deleteCompanyEmployee = async (companyUserId) => {
    try {
        const isExist = await customers.findOne({ where: { id: companyUserId, status: 'active', role_id: 6 } })
        if (!isExist) throw new BuscalError("עובד לא קיים")

        await customers.update({
            status: 'deleted'
        }, { returning: true, where: { id: companyUserId } })

        await customers_companies.destroy({
            where: { customer_id: companyUserId }
        })
        return "נמחק בהצלחה."

    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't delete user: ${err.message}`)

    }
}

const editCompanyEmployee = async (userDetails, userId) => {
    try {
        // const validationResult = await Joi.validate(userDetails, customerValidation);
        // if (!validationResult) {
        //     return 'data not valid '+validationResult;
        // }

        const isExist = await customers.findOne({
            where: {
                id: userId,
                status: 'active',
                role_id: 6
            }
        })
        if (!isExist) throw new BuscalError("לקוח לא קיים")

        const checkCustomerDetails = await customers.findOne({
            where: {
                [Op.or]: [
                    { phone: userDetails.phone },
                    { email: userDetails.email }
                ],
                [Op.not]: [{ id: userId }]
            }
        })
        if (checkCustomerDetails) throw new BuscalError("אחד או יותר מהפרטים שהזנת שייכים ללקוח אחר")
        const customerCompany = await customers_companies.findOne({ where: { customer_id: userId } })
        if (!customerCompany) throw new BuscalError("לקוח זה לא שייך לאף חברה")
        
        if (userDetails.password.length) {
            await customers.update({
                first_name: userDetails.first_name,
                last_name: userDetails.last_name,
                fax: userDetails.fax,
                phone: userDetails.phone,
                email: userDetails.email,
                password: encrypt(userDetails.password),
                email_notification: userDetails.email_notification,
                sms_notification: userDetails.sms_notification,
                city: userDetails.city,
                street: userDetails.street,
                postal_code: userDetails.postal_code
            }, { where: { id: userId } })
        }
        else {
            await customers.update({
                first_name: userDetails.first_name,
                last_name: userDetails.last_name,
                fax: userDetails.fax,
                phone: userDetails.phone,
                email: userDetails.email,
                email_notification: userDetails.email_notification,
                sms_notification: userDetails.sms_notification,
                city: userDetails.city,
                street: userDetails.street,
                postal_code: userDetails.postal_code
            }, { where: { id: userId } })

        }

        return "עודכן בהצלחה"

    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't edit custumer: ${error.message}`)
    }


}

const getCompanyEmployee = async (empid, userId) => {
    try {
        const company = await customers_companies.findOne({
            where: {
                customer_id: userId
            }
        })

        const userCompany = await customers_companies.findOne({
            where: {
                customer_id: empid,
                company_id: company.company_id
            }
        })

        if (userCompany) {
            const userDetails = await customers.findOne({
                attributes: ['id', 'first_name', 'last_name', 'fax', 'phone', 'email', 'email_notification', 'sms_notification', 'city', 'street', 'postal_code', 'type'],
                where: {
                    id: empid, status: 'active'
                }
            })
            return userDetails
        }

        else throw new BuscalError("לא נמצא")

    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't get userCompany: ${err.message}`)
    }
}

module.exports = {
    summary,
    getCompanyEmployees,
    uploadCompanyFiles,
    directUploadCompanyFiles,
    loadCompanyFiles,
    loadWaitingCompanyFiles,
    deleteCompanyEmployee,
    editCompanyEmployee,
    getCompanyEmployee,
}