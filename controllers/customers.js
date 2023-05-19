const { customers, waiting_customers, customers_companies, roles, companies, employees } = require('../models')
const { Op } = require("sequelize");
const { encrypt } = require("./encrypt")
const { customerValidation } = require('../middleware/validations');
const { BuscalError } = require('../models/Errors');

const getCustomers = async (query) => {
  try {
    let Allcustomers = await customers.findAll({
      attributes: ['id', 'first_name', 'last_name', 'type'],
      where: { status: 'active' },
      include: [{ model: roles },
      {
        model: companies,
        through: { attributes: [] },

        attributes: ['name', 'code']
      }],
      offset: (parseInt(query.page) - 1) * parseInt(query.size),
      limit: parseInt(query.size) + 1,
    });

    let hasNext = false, hasPrev = false, res;
    res = Allcustomers;
    if (Allcustomers.length > query.size) {
      hasNext = true;
      res = Allcustomers.slice(0, query.size);
    }
    if (query.page != 1) {
      hasPrev = true;

    }
    return { res, hasNext, hasPrev };
  } catch (error) {
    throw new Error(`Can't get custumers: ${error.message}`);
  }
}

const getCustomer = async (cusId) => {
  try {
    const customer = await customers.findOne({
      attributes: ['id', 'first_name', 'last_name', 'fax', 'phone', 'email', 'email_notification', 'sms_notification', 'city', 'street', 'postal_code', 'type'],
      where: { id: cusId, status: 'active' },
      include: [{
        model: companies,
        attributes: ['id', 'name', 'phone', 't_phone', 'code', 'email', 'fax', 'city', 'street', 'postal_code', 'subscription'],
        through: { attributes: [] }
      }]
    });
    if (customer) return customer;
    throw new BuscalError("לקוח לא קיים")
  } catch (err) {
    if (err instanceof BuscalError)
      throw err
    throw new Error(`Can't get custumer: ${error.message}`);
  }
}

const getWaitingCustomers = async () => {
  try {
    const waiting = await waiting_customers.findAll({
      attributes: ['id', 'creation_date', 'company_name', 'company_phone']
    })
    if (waiting) return waiting;
    throw new BuscalError("אין לקוחות ממתנים")

  } catch (err) {
    if (err instanceof BuscalError)
      throw err
    throw new Error(`Can't get custumers: ${error.message}`);
  }
}

const getWaitingCustomer = async (cusid) => {
  try {
    const waiting = await waiting_customers.findOne({
      attributes: ['id', 'first_name', 'last_name', 'fax', 'phone',
        'email', 'email_notification', 'sms_notification', 'city',
        'street', 'postal_code', 'company_name', 'company_phone',
        'company_t_phone', 'company_email', 'code', 'company_fax',
        'company_city', 'company_street', 'company_postal_code',
        'subscription', 'company_type'],
      where: { id: cusid }
    })

    if (waiting) return waiting;
    throw new BuscalError("אין לקוחות ממתנים")

  } catch (err) {
    if (err instanceof BuscalError)
      throw err
    throw new Error(`Can't get custumer: ${error.message}`);
  }
}

const deleteWaitingCustomer = async (cusid) => {

  try {
    await waiting_customers.destroy({ where: { id: cusid } })
    return "נמחק בהצלחה"
  } catch (err) {
    throw new Error(`Can't delete customer.${err.message}`)
  }
}

const editCustomer = async (userDetails, userId) => {

  try {
    // const validationResult = await Joi.validate(userDetails, customerValidation);
    // if (!validationResult) {
    //     return 'data not valid '+validationResult;
    // }

    const isExist = await customers.findOne({
      where: {
        id: userId,
        status: 'active'
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

    if (userDetails.type === 'חברה') {
      const customerCompany = await customers_companies.findOne({ where: { customer_id: userId } })
      if (!customerCompany) throw new BuscalError("לקוח זה לא שייך לאף חברה")
      
      const checkCompanyDetails = await companies.findOne({
        where: {
          [Op.or]: [
            { name: userDetails.companyname },
            { phone: userDetails.companyphone },
            { t_phone: userDetails.company_t_phone },
            { email: userDetails.companyemail }
          ],
          [Op.not]: [{ id: customerCompany.company_id }]
        }
      })
      if (checkCompanyDetails) throw new BuscalError("אחד או יותר מהפרטים שהזנת שייכים לחברה אחרת")
      await companies.update({
        name: userDetails.companyname,
        phone: userDetails.companyphone,
        t_phone: userDetails.company_t_phone,
        code: userDetails.companycode,
        email: userDetails.companyemail,
        fax: userDetails.companyfax,
        city: userDetails.companycity,
        street: userDetails.companystreet,
        postal_code: userDetails.companypostalcode,
        subscription: userDetails.subscription
      }, { returning: true, where: { id: customerCompany.company_id } })
    }

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
      }, { returning: true, where: { id: userId } })
    

    return "עודכן בהצלחה"

  } catch (err) {
    if (err instanceof BuscalError)
      throw err
    throw new Error(`Can't edit custumer: ${error.message}`);
  }


}

//deleteCustomer
const deleteCustomer = async (customerId) => {

  try {

    const isExist = await customers.findOne({ where: { id: customerId, status: 'active' } })
    if (!isExist) throw new BuscalError("לקוח לא קיים")

    const userRole = await roles.findOne({ where: { id: isExist.role_id } })

    if (userRole.name === 'customer') {
      await customers.update({
        status: 'deleted'
      }, { returning: true, where: { id: customerId } })
      return "לקוח נמחק"
    }
    else if (userRole.name === 'userCompany') {
      await customers.update({
        status: 'deleted'
      }, { returning: true, where: { id: customerId } })

      await customers_companies.destroy({
        where: { customer_id: customerId }
      })
      return "לקוח נמחק"
    }
    else if (userRole.name === 'adminCompany') {
      const company = await customers_companies.findOne({ where: { customer_id: customerId } })
      const usersCompany = await customers_companies.findAll({ where: { company_id: company.company_id } })
      usersCompany.map(async (cus) => {
        await customers.update({
          status: 'deleted'
        }, { returning: true, where: { id: cus.customer_id } })
      })

      usersCompany.map(async (cus) => {
        await customers_companies.destroy({ where: { customer_id: cus.customer_id } })
      })

      await companies.update({
        status: 'deleted'
      }, { returning: true, where: { id: company.company_id } })
      return "החברה וכל עובדיה נמחקו"
    }

    throw new BuscalError("אי אפשר למחוק משתמש זה")

  } catch (err) {
    if (err instanceof BuscalError)
      throw err
    throw new Error(`Can't delete user: ${err.message}`)
  }
}


const createNewUserCompany = async (userDetails, userId) => {

  try {

    // const validationResult = await Joi.validate(userDetails, customerValidation);
    // if (!validationResult) {
    //     return 'data not valid '+validationResult;
    // }

    const userExist = await customers.findOne({
      where: {
        status: 'active',
        [Op.or]: [
          { phone: userDetails.phone },
          { email: userDetails.email }
        ]
      }
    })

    if (userExist) throw new BuscalError("אחד או יותר מהפרטים שהזנת שייכים ללקוח אחר")

    const role = await roles.findOne({
      where: {
        name: 'userCompany'
      }
    })

    const company = await customers_companies.findOne({ where: { customer_id: userId } })
    if (!company) throw new BuscalError("לא שייך לאף חברה")

    const userCompany = await customers.create({
      first_name: userDetails.first_name,
      last_name: userDetails.last_name,
      fax: userDetails.fax,
      phone: userDetails.phone,
      email: userDetails.email,
      password: encrypt(userDetails.password),
      city: userDetails.city,
      street: userDetails.street,
      postal_code: userDetails.postal_code,
      type: "עובד חברה",
      creator: userId,
      creation_date: new Date(),
      email_notification: userDetails.email_notification,
      sms_notification: userDetails.sms_notification,
      role_id: role.dataValues.id
    })

    await customers_companies.create({
      customer_id: userCompany.id,
      company_id: company.company_id
    })

    return "נוצר בהצלחה"

  } catch (err) {
    if (err instanceof BuscalError)
      throw err
    throw new Error(`Can't create userCompany: ${err.message}`)
  }

}

const getmyDetails = async (userId) => {
  try {

    const Role = await roles.findOne({ where: { name: 'adminCompany' } })

    const adminCompany = await customers.findOne({
      where: { id: userId, role_id: Role.dataValues.id, status: 'active' }
    })
    if (adminCompany) {
      const details = await customers.findOne({
        where: { id: userId },
        attributes: ['id', 'first_name', 'last_name', 'fax', 'phone', 'email', 'email_notification', 'sms_notification', 'city', 'street', 'postal_code', 'type'],
        include: [{ model: companies, through: { attributes: [] }, attributes: ['id', 'name', 'phone', 't_phone', 'email', 'code', 'fax', 'city', 'street', 'postal_code', 'subscription'] }]
      })
      return details
    }
    else {
      const details = await customers.findOne({
        where: { id: userId, status: 'active' },
        attributes: ['first_name', 'last_name', 'fax', 'phone', 'email', 'email_notification', 'sms_notification', 'city', 'street', 'postal_code', 'type']
      })
      if (details) return details
    }

    throw new BuscalError("לא נמצא")
  } catch (err) {
    if (err instanceof BuscalError)
      throw err
      throw new Error(`Can't get details: ${err.message}`)
  }
}

const updatemyDetails = async (userDetails, userId) => {
  try {

    const detailsIsEXistCustomer = await customers.findOne({
      where: {
        [Op.or]: [
          { phone: userDetails.phone },
          { email: userDetails.email }
        ],
        [Op.not]: [{ id: userId }]
      }
    })
    if (detailsIsEXistCustomer) throw new BuscalError("אחד או יותר מהפרטים שהזנת שייכים ללקוח אחר")

    const customer = await customers.findOne({where:{id: userId, status: 'active'}})

    const Role = await roles.findOne({ where: { name: 'adminCompany' } })

    if(customer.role_id === Role.id){
    const customercompany = await customers_companies.findOne({ where: { customer_id: userId } })
    if (customercompany) {
      const detailsIsEXistCompany = await companies.findOne({
        where: {
          [Op.or]: [
            { phone: userDetails.companyphone },
            { email: userDetails.companyemail },
            { name: userDetails.companyname },
            { fax: userDetails.companyfax },
            { t_phone: userDetails.company_t_phone },
          ],
          [Op.not]: [{ id: customercompany.company_id }]
        }
      })
      if (detailsIsEXistCompany) throw new BuscalError("אחד או יותר מהפרטים שהזנת שייכים לחברה אחרת")
    }}

    const newUpdateCustomer = await customers.findOne({ where: { id: userId, status: 'active' } })
    if (newUpdateCustomer) {

      if (newUpdateCustomer.role_id === Role.id) {
        const userCompany = await customers_companies.findOne({ where: { customer_id: userId } })
        await companies.update({
          name: userDetails.companyname,
          phone: userDetails.companyphone,
          t_phone: userDetails.company_t_phone,
          email: userDetails.companyemail,
          code: userDetails.code,
          fax: userDetails.companyfax,
          city: userDetails.companycity,
          street: userDetails.companystreet,
          postal_code: userDetails.companypostal_code,
          subscription: userDetails.subscription
        }, { where: { id: userCompany.company_id } }
        )
      }

      if (userDetails.password.length) {
        await customers.update({
          first_name: userDetails.first_name,
          last_name: userDetails.last_name,
          email: userDetails.email,
          phone: userDetails.phone,
          password: encrypt(userDetails.password),
          city: userDetails.city,
          street: userDetails.street,
          postal_code: userDetails.postal_code,
          fax: userDetails.fax,
          email_notification: userDetails.email_notification,
          sms_notification: userDetails.sms_notification,
        }, { where: { id: userId } })

      }
      else {
        await customers.update({
          first_name: userDetails.first_name,
          last_name: userDetails.last_name,
          email: userDetails.email,
          phone: userDetails.phone,
          city: userDetails.city,
          street: userDetails.street,
          postal_code: userDetails.postal_code,
          fax: userDetails.fax,
          email_notification: userDetails.email_notification,
          sms_notification: userDetails.sms_notification,
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
  getCustomers,
  editCustomer,
  deleteCustomer,
  createNewUserCompany,
  getCustomer,
  getWaitingCustomers,
  getWaitingCustomer,
  deleteWaitingCustomer,
  getmyDetails,
  updatemyDetails
}