const { employees, roles, employees_files, customers, companies } = require('../models')
const { Op } = require("sequelize");
const { encrypt } = require("./encrypt")
const { employeeValidation, closedAvailableVehicleValidation } = require('../middleware/validations');
const { BuscalError } = require('../models/Errors');

const getCustomersCreatedBy = async (userId, query) => {
    try {
        const Companies = await customers.findAll({
            where: {
                creator: userId, 
                [Op.or]: [{ type: 'חברה' }, { type: 'עובד חברה' }]
            },
            attributes: ['creation_date', 'first_name', 'last_name'],
            include: [{ model: companies, attributes: ['name'] }],
            offset: (parseInt(query.page) - 1) * parseInt(query.size),
            limit: parseInt(query.size) + 1
        });

        const Customers = await customers.findAll({
            where: {
                creator: userId, 
                [Op.not]: [{ type: ['עובד חברה', 'חברה']}],
            },
            attributes: ['creation_date', 'first_name', 'last_name', 'type'],
            offset: (parseInt(query.page) - 1) * parseInt(query.size),
            limit: parseInt(query.size) + 1
        });
        Allcustomers = Customers.concat(Companies)
        let hasNext = false, hasPrev = false;
        if (Allcustomers.length > query.size) {
            hasNext = true;
        }
        if (query.page != 1) {
            hasPrev = true;
        }
        Allcustomers = Allcustomers.slice(0, Allcustomers.length); // deleted -1
        let created = Allcustomers.map((cus) => {
            if(cus.companies)
            return {
                creation_date: cus.creation_date,
                type: cus.companies[0].name,
                first_name: cus.first_name,
                last_name: cus.last_name
            }
            else return { 
                creation_date: cus.creation_date,
                first_name: cus.first_name,
                last_name: cus.last_name,
                type: cus.type
            }
        })
        return { created, hasNext, hasPrev };

    } catch (error) {
        throw new Error(`Can't get custumers: ${error.message}`);
    }
}

const getEmployees = async () => {


    try {
        const role = await roles.findOne({ where: { name: 'admin' } })

        const Allemployees = await employees.findAll({
            attributes: ['id', 'first_name', 'last_name'],
            include: [{ model: roles, attributes: ['name'] }],
            where: {
                status: 'active',
                [Op.not]: [
                    { role_id: role.id }
                ]
            }
        });
        return Allemployees;
    } catch (error) {
        throw new Error(`Cant get employees: ${error.message}`);
    }


}

const getEmployeesByIdentity = async (identityParam) => {


    try {
        const Allemployees = await employees.findOne({
            attributes: ['id', 'first_name', 'last_name'],
            include: [{ model: roles, attributes: ['name'] }],
            where: {
                identity: identityParam
            }
        });
        return Allemployees;
    } catch (error) {
        throw new Error(`Cant get employees: ${error.message}`);
    }


}

const createEmployee = async (emp) => {
    try {

        // const validationResult = await Joi.validate(emp, employeeValidation);
        // if (!validationResult) {
        //     return 'data not valid '+validationResult;
        // }

        const isExist = await employees.findOne({
            where: {
                [Op.or]: [{ identity: emp.identity }, { email: emp.email }, { phone: emp.phone }]
            }
        })

        if (isExist) throw new BuscalError("אחד או יותר מהפרטים שהזנת שייכים לעובד אחר")

        const newEmployee = await employees.create({
            first_name: emp.first_name,
            last_name: emp.last_name,
            email: emp.email,
            phone: emp.phone,
            identity: emp.identity,
            password: encrypt(emp.password),
            city: emp.city,
            street: emp.street,
            postal_code: emp.postal_code,
            role_id: emp.role_id
        })


        return newEmployee.id
    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't create employee: ${err.message}`)
    }
}

const uploadEmployeeFiles = async (files, id) => {
    try {
        files.map(async (file) => {
            await employees_files.create({
                path: file.location,
                employee_id: id
            });
        })
        return 'Successfully files added and waiting for admin permession'
    } catch (err) {
        throw new Error(`Can't add files: ${err.message}`)
    }
}


const loadEmployeeFiles = async (id) => {
    try {
        let files = await employees_files.findAll({
            where: { employee_id: id }
        });
        return files;

    } catch (err) {
        throw new Error(`Can't load files: ${err.message}`)
    }
}


const editEmployee = async (emp, employeeId) => {
    try {
        // const validationResult = await Joi.validate(emp, employeeValidation);
        // if (!validationResult) {
        //     return 'data not valid '+validationResult;
        // }

        const isExist = await employees.findOne({
            where: {
                id: employeeId,
                status: 'active'
            }
        })

        if (!isExist) throw new BuscalError("עובד לא קיים")

        if (emp.password.length) {
            await employees.update({
                first_name: emp.first_name,
                last_name: emp.last_name,
                email: emp.email,
                phone: emp.phone,
                password: encrypt(emp.password),
                city: emp.city,
                street: emp.street,
                postal_code: emp.postal_code,
                role_id: emp.role_id
            }, { returning: true, where: { id: employeeId } })
        }

        else {
            await employees.update({
                first_name: emp.first_name,
                last_name: emp.last_name,
                email: emp.email,
                phone: emp.phone,
                city: emp.city,
                street: emp.street,
                postal_code: emp.postal_code,
                role_id: emp.role_id
            }, { returning: true, where: { id: employeeId } })

        }

        return "עודכן בהצלחה"
    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't edit employee: ${err.message}`)
    }
}

//deleteEmployee
const deleteEmployee = async (employeeId) => {

    try {
        const isExist = await employees.findOne({
            where: {
                status: 'active',
                id: employeeId
            },
        });

        if (!isExist) throw new BuscalError("עובד לא קיים")

        await employees.update({
            status: 'deleted'
        }, { returning: true, where: { id: employeeId } })

        return "נמחק בהצלחה"
    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't delete employee: ${err.message}`)
    }
}


const getEmployee = async (empid) => {

    try {

        const empIsExist = await employees.findOne({ where: { id: empid, status: 'active' } })

        if (!empIsExist) throw new BuscalError("עובד לא קיים")

        const employee = await employees.findOne({
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'city', 'street', 'postal_code', 'role_id'],
            where: { id: empid }
        });

        return employee
    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't get employee: ${error.message}`);
    }
}

const getmyDetails = async (userId) => {
    try {

        const emp = await employees.findOne({
            where: { id: userId, status: 'active' },
            attributes: ['first_name', 'last_name', 'phone', 'email', 'city', 'street', 'postal_code', 'role_id'],

        })
        if (emp) return emp
        throw new BuscalError("לא נמצא")
    } catch (err) {
        if (err instanceof BuscalError)
            throw err
            throw new Error(`Can't get details: ${err.message}`)
    }
}


const updatemyDetails = async (userDetails, userId) => {
    try {

        const detailsIsEXist = await employees.findOne({
            where: {
                [Op.or]: [
                    { phone: userDetails.phone },
                    { email: userDetails.email }
                ],
                [Op.not]: [{ id: userId }]
            }
        })
        if (detailsIsEXist) throw new BuscalError("אחד או יותר מהפרטים שהזנת שייכים לעובד אחר")

        const newUpdate = await employees.findOne({ where: { id: userId, status: 'active' } })
        if (newUpdate) {
            if (userDetails.password.length) {
                await employees.update({
                    first_name: userDetails.first_name,
                    last_name: userDetails.last_name,
                    email: userDetails.email,
                    phone: userDetails.phone,
                    password: encrypt(userDetails.password),
                    city: userDetails.city,
                    street: userDetails.street,
                    postal_code: userDetails.postal_code,
                }, { where: { id: userId } })

            }
            else {
                await employees.update({
                    first_name: userDetails.first_name,
                    last_name: userDetails.last_name,
                    email: userDetails.email,
                    phone: userDetails.phone,
                    city: userDetails.city,
                    street: userDetails.street,
                    postal_code: userDetails.postal_code,
                }, { where: { id: userId } })
            }
        }

        return "עודכן"

    } catch (err) {
        if (err instanceof BuscalError)
            throw err
            throw new Error(`Can't update details: ${err.message}`)
    }

}

module.exports = {
    getEmployees,
    createEmployee,
    editEmployee,
    deleteEmployee,
    getEmployee,
    getCustomersCreatedBy,
    getEmployeesByIdentity,
    uploadEmployeeFiles,
    getmyDetails,
    updatemyDetails,
    loadEmployeeFiles
}