const { closed_available_vehicles, customers_companies, available_vehicles, customers, vehicle, companies, extra, stop_stations_orders, vehicle_type, trip } = require('../models')
const { Op } = require("sequelize");
const { availableVehicleValidation, closedAvailableVehicleValidation } = require('../middleware/validations');
const { sendEmail } = require('./sendEmail')
const { BuscalError } = require('../models/Errors');
const { encryptID } = require("./encrypt")

// //get all available vehicles by filter
const getAvailableVehicles = async (query, userId) => {
  let filter = {
    active: '1',
    expired: '0'
  };
  if (query.startDate != 'all') {
    startDate = query.startDate;
    endDate = '3020-04-11';
    if (query.endDate != 'all') {
      endDate = query.endDate;
    }
    Object.assign(filter, {
      'start_date': {
        [Op.between]: [startDate, endDate]
      }
    });
  }
  if (query.startTime != 'all') {
    startTime = query.startTime;
    endTime = '23:59:59';
    if (query.endTime != 'all') {
      endTime = query.endTime
    }
    Object.assign(filter, {
      'start_hour': {
        [Op.between]: [startTime, endTime]
      }
    });
  }

  let vehicleType = {};
  if (query.vehicleType != 'all') {
    Object.assign(vehicleType, {
      type: query.vehicleType
    });
  }

  let capacity = {};
  if (query.capacity != 'all') {
    Object.assign(capacity, {
      capacity: query.capacity
    });
  }

  const myCompany = await customers_companies.findOne({ where: { customer_id: userId } })
  Object.assign(filter, {
    company_id: myCompany.company_id
  });
  try {
    let availableVehiclesFromMyCompany = await available_vehicles.findAll({
      where: filter,
      include: [
        {
          model: vehicle,
          where: capacity,
          include: [{
            model: vehicle_type,
            where: vehicleType
          }]
        }
      ],
      order:
        [
          ['start_date', 'ASC'],
          ['start_hour', 'ASC']
        ],
      offset: (parseInt(query.page) - 1) * parseInt(query.size),
      limit: parseInt(query.size) + 1,
    });

    //  console.log(availableVehiclesFromMyCompany[0].vehicle.vehicle_type.type)
    if (availableVehiclesFromMyCompany) {
      availableVehiclesFromMyCompany = availableVehiclesFromMyCompany.map((av) => {
        return {
          id: av.id,
          serial_number: av.encrypted_id,
          start_date: av.start_date,
          end_date: av.end_date,
          start_hour: av.start_hour,
          end_hour: av.end_hour,
          vehicle: av.vehicle.vehicle_type.type,
          capacity: av.vehicle.capacity,
        }
      })
    }

    Object.assign(filter, {
      company_id: {
        [Op.not]: myCompany.company_id
      }
    });
    let availableVehiclesNotFromMyCompany = await available_vehicles.findAll({
      where: filter,
      include: [
        {
          model: vehicle,
          where: capacity,
          include: [{
            model: vehicle_type,
            where: vehicleType
          }
          ],
        },
        { model: customers, attributes: ['email'] },
        { model: companies, attributes: ['subscription'] }
      ],
      order:
        [
          ['start_date', 'ASC'],
          ['start_hour', 'ASC']
        ],
      offset: (parseInt(query.page) - 1) * parseInt(query.size),
      limit: parseInt(query.size) + 1,
    });

    if (availableVehiclesNotFromMyCompany) {
      availableVehiclesNotFromMyCompany = availableVehiclesNotFromMyCompany.map((av) => {
        return {
          id: av.id,
          serial_number: av.encrypted_id,
          start_date: av.start_date,
          end_date: av.end_date,
          start_hour: av.start_hour,
          end_hour: av.end_hour,
          vehicle: av.vehicle.vehicle_type.type,
          capacity: av.vehicle.capacity,
          description: av.description,
          customerEmail: av.customer.email,
          subscription: av.company.subscription
        }
      })
    }

    let hasNext = false, hasPrev = false;
    if (availableVehiclesFromMyCompany.length > query.size) {
      hasNext = true;
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    availableVehiclesFromMyCompany = availableVehiclesFromMyCompany.slice(0, query.size);
    let res = {
      availableVehiclesFromMyCompany: {
        av: availableVehiclesFromMyCompany, hasNext, hasPrev
      }
    }
    hasNext = false, hasPrev = false;
    if (availableVehiclesNotFromMyCompany.length > query.size) {
      hasNext = true;
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    availableVehiclesNotFromMyCompany = availableVehiclesNotFromMyCompany.slice(0, query.size);

    res.availableVehiclesNotFromMyCompany = {
      av: availableVehiclesNotFromMyCompany, hasNext, hasPrev
    }
    return res;

  } catch (error) {
    throw new Error(`Can't get AvailableVehicles: ${error.message}`);
  }


}


// //get available vehicles by id
const getAvailableVehicle = async (id) => {
  try {
    const AvailableVehicles = await available_vehicles.findOne({
      where: {
        id: id,
        active: 1
      },
      include: [
        {
          model: vehicle,
          include: [{
            model: vehicle_type
          }
          ],
        },
        {
          model: customers,
        },
        {
          model: companies,
        }
      ],

    });

    if (AvailableVehicles == null)
      throw new BuscalError("Vehicle doesn't exist")


    const av = {
      start_date: AvailableVehicles.start_date,
      end_date: AvailableVehicles.end_date,
      start_hour: AvailableVehicles.start_hour,
      end_hour: AvailableVehicles.end_hour,
      vehicle_id: AvailableVehicles.vehicle_id,
      capacity: AvailableVehicles.vehicle.capacity,
      description: AvailableVehicles.description,
      customer_id: AvailableVehicles.customer.id,
      firstName: AvailableVehicles.customer.first_name,
      lastName: AvailableVehicles.customer.last_name,
      customer_fax: AvailableVehicles.customer.fax,
      customer_phone: AvailableVehicles.customer.phone,
      customer_email: AvailableVehicles.customer.email,
      company: AvailableVehicles.company.name,
      company_phone: AvailableVehicles.company.phone,
      company_t_phone: AvailableVehicles.company.t_phone,
      company_email: AvailableVehicles.company.email,
      company_fax: AvailableVehicles.company.fax,
    }

    return av;
  } catch (error) {
    throw new Error(`Can't get AvailableVehicles: ${error.message}`);
  }
}


const CreateAvailableVehicle = async (AvailableVehicles, userId) => {

  try {
    // const validationResult = await Joi.validate(AvailableVehicles, availableVehicleValidation);
    // if (!validationResult) {
    //     return 'data not valid '+validationResult;
    // }

    const userCompany = await customers_companies.findOne({ where: { customer_id: userId } })

    available_vehicles.addHook('afterCreate', (newAv, options) => {

      available_vehicles.update({
        encrypted_id: encryptID((newAv.id).toString())
      }, { where: { id: newAv.id } })
    })

    const newAv = await available_vehicles.create({
      customer_id: userId,
      company_id: userCompany.company_id,
      vehicle_id: AvailableVehicles.vehicle_id,
      start_date: AvailableVehicles.start_date,
      end_date: AvailableVehicles.end_date,
      start_hour: AvailableVehicles.start_hour,
      end_hour: AvailableVehicles.end_hour,
      description: AvailableVehicles.description
    })


    return "נוצר בהצלחה"
  } catch (err) {
    throw new Error(`Can't create order: ${err.message}`)
  }
}
const editAvailableVehicles = async (availableVehicles, availableVehiclesId) => {

  try {
    // const validationResult = await Joi.validate(availableVehicles, availableVehicleValidation);
    // if (!validationResult) {
    //     return 'data not valid '+result;
    // }
    const availableVehiclesIsExist = await available_vehicles.findOne({
      where: {
        id: availableVehiclesId, active: 1
      },
    });

    if (!availableVehiclesIsExist)
      throw new BuscalError("רכב לא נמצא או נשלף כבר")

    await available_vehicles.update({
      vehicle_id: availableVehicles.vehicle_id,
      start_date: availableVehicles.start_date,
      end_date: availableVehicles.end_date,
      start_hour: availableVehicles.start_hour,
      end_hour: availableVehicles.end_hour,
      description: availableVehicles.description
    }, { returning: true, where: { id: availableVehiclesId } });

    return "עודכן בהצלחה"
  } catch (err) {
    throw new Error(`Can't update order: ${err.message}`)
  }
}

const deleteAvailableVehicles = async (availableVehiclesId) => {

  try {
    const availableVehiclesIsExist = await available_vehicles.findOne({
      where: {
        id: availableVehiclesId,
        active: 1
      },
    });

    if (!availableVehiclesIsExist)
      throw new BuscalError("רכב לא נמצא או נשלף")



    await available_vehicles.destroy(
      { where: { id: availableVehiclesId } });


    return "נמחק בהצלחה"
  } catch (err) {
    throw new Error(`Can't delete Availabe Vehicle: ${err.message}`)
  }
}



// //get all available vehicles for CUSTOMER company with id= customerId


const getCustomerComapnyAllAvailableVehicles = async (query, userId) => {
  try {
    let filter = {
      active: '1',
      expired: '0'
    };
    if (query.startDate != 'all') {
      startDate = query.startDate;
      endDate = '3020-04-11';
      if (query.endDate != 'all') {
        endDate = query.endDate;
      }
      Object.assign(filter, {
        'start_date': {
          [Op.between]: [startDate, endDate]
        }
      });
    }
    if (query.startTime != 'all') {
      startTime = query.startTime;
      endTime = query.endTime || '23:59:59';

      Object.assign(filter, {
        'start_hour': {
          [Op.between]: [startTime, endTime]
        }
      });
    }
    endDate = query.endDate;

    const AvailableVehicle = await customers_companies.findOne({
      where: {
        customer_id: userId
      }
    });

    Object.assign(filter, {
      'company_id': AvailableVehicle.company_id
    });

    let availableVehicles = await available_vehicles.findAll({
      include: [
        {
          model: vehicle,
          include: [{
            model: vehicle_type
          }
          ],
        },
        {
          model: companies,
        },
        {
          model: customers,
        }
      ],
      where: filter,
      order:
        [
          ['start_date', 'ASC'],
          ['start_hour', 'ASC']
        ],
      offset: (parseInt(query.page) - 1) * parseInt(query.size),
      limit: parseInt(query.size) + 1,

    });


    availableVehicles = availableVehicles.map((order) => {
      return {
        id: order.id,
        serial_number: order.encrypted_id,
        startDate: order.start_date,
        endDate: order.end_date,
        capacity: order.vehicle.capacity,
        vehicleType: order.vehicle.vehicle_type.type,
        customerName: order.customer.first_name + ' ' + order.customer.last_name,
        phone: order.customer.phone

      }
    })

    let hasNext = false, hasPrev = false;
    if (availableVehicles.length > query.size) {
      hasNext = true;
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    availableVehicles = availableVehicles.slice(0, query.size);
    return { availableVehicles, hasNext, hasPrev };

  } catch (error) {
    throw new Error(`Can't get orders: ${error.message}`);
  }


}

//http://localhost:3001/companies/closed_available_vehicles_by_my_company (i took them)
const getClosedAvailableVehicles = async (query, userId) => {
  try {
    const customersCompanies = await customers_companies.findOne({
      where: {
        customer_id: userId
      }
    });

    let closedOrders = await closed_available_vehicles.findAll({
      where: {
        company_id: customersCompanies.company_id
      },
      include: [
        {
          model: available_vehicles,
          include: [{
            model: vehicle,
            include: [{
              model: vehicle_type,

            }
            ]
          },
          { model: companies, attributes: ['name'] }
          ]

        },
        {model:customers, as: 'userCompany'}
      ],

      // offset: (parseInt(query.page) - 1) * parseInt(query.size),
      // limit: parseInt(query.size) + 1,

    });

    closedOrders = closedOrders.map((order) => {
      return {
        id: order.available_vehicle_id,
        serial_number: order.available_vehicle.encrypted_id,
        startDate: order.available_vehicle.start_date,
        endDate: order.available_vehicle.end_date,
        capacity: order.available_vehicle.vehicle.capacity,
        vehicleType: order.available_vehicle.vehicle.vehicle_type.type,
        startHour: order.available_vehicle.start_hour,
        endHour: order.available_vehicle.end_hour,
        companyName: order.available_vehicle.company.name,
        userCompanyName: order.userCompany.first_name + ' ' + order.userCompany.last_name
      }
    })

    let hasNext = false, hasPrev = false;
    if (closedOrders.length > query.size) {
      hasNext = true;
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    closedOrders = closedOrders.slice(0, closedOrders.length);
    return { closedOrders, hasNext, hasPrev };

  } catch (error) {
    throw new Error(`Can't get closed orders: ${error.message}`);
  }


}
// // get the closed available vehicles (i'm the customer) (i made request and someone took them)
// localhost:3001/companies/closed_available_vehicles_by_my_company_customer
const getClosedAvailableVehiclesCustomer = async (query, userId) => {
  try {
    const customersCompanies = await customers_companies.findOne({
      where: {
        customer_id: userId
      }
    });

    let closedOrders = await closed_available_vehicles.findAll({
      where: {
        customer_company_id: customersCompanies.company_id
      },
      attributes: ['available_vehicle_id'],
      include: [
        {
          model: customers,
          attributes: ['first_name', 'last_name'],
          include: [{
            model: companies,
            attributes: ['name'],
            through: { attributes: [] },
            where: {
              id: customersCompanies.company_id
            }
          }
          ],

        },
        {
          model: customers, as: 'userCompany',
          include: [{
            model: companies
          }
          ]
        },
        {
          model: available_vehicles,
          // attributes: ['start_date', 'end_date'],
          include: [{ model: vehicle, attributes: ['capacity'], include: [{ model: vehicle_type, attributes: ['type'] }] }]
        }


      ],

      // offset: (parseInt(query.page) - 1) * parseInt(query.size),
      // limit: parseInt(query.size) + 1,

    });
    closedOrders = closedOrders.map((order) => {
      return {
        id: order.available_vehicle_id,
        serial_number: order.available_vehicle.encrypted_id,
        startDate: order.available_vehicle.start_date,
        endDate: order.available_vehicle.end_date,
        startHour: order.available_vehicle.start_hour,
        endHour: order.available_vehicle.end_hour,
        capacity: order.available_vehicle.vehicle.capacity,
        type: order.available_vehicle.vehicle.vehicle_type.type,
        companyName: order.userCompany.companies[0].name,
        customerName: order.customer.first_name + ' ' + order.customer.last_name
      }
    })
    let hasNext = false, hasPrev = false;
    if (closedOrders.length > query.size) {
      hasNext = true;
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    closedOrders = closedOrders.slice(0, closedOrders.length);
    return { closedOrders, hasNext, hasPrev };

  } catch (err) {
    throw new Error(`Can't get closed orders: ${err.message}`);
  }
}


const closingOnVehicleSummary = async (sum, userId) => {
  try {
    const availableVehiclesIsExist = await available_vehicles.findOne({
      where: {
        encrypted_id: sum.serial_number_Bus,
        active: 1,
        expired: 0
      },
      include: [{ model: companies }]
    });
    if (!availableVehiclesIsExist) throw new BuscalError("רכב לא נמצא או נשלף כבר")

    await available_vehicles.update({
      active: 0
    },
      { returning: true, where: { id: sum.availableVehiclesId } }
    )

    const companyTook = await customers_companies.findOne({ where: { customer_id: userId } })

    await closed_available_vehicles.create({
      company_id: companyTook.company_id, // company that took the av
      user_company_id: userId, // userCompany/AdminCompany who took the av
      customer_id: availableVehiclesIsExist.customer_id, // customer who request av
      customer_company_id: availableVehiclesIsExist.company_id, // company that request av
      available_vehicle_id: sum.availableVehiclesId
    })

    //sendEmail
    const customer = await customers.findOne({
      where: {
        id: availableVehiclesIsExist.customer_id,
        status: 'active'
      }
    });
    if (!customer) throw new BuscalError("לקוח לא נמצא")
    sendEmail(customer.email, `<h2 dir="rtl">שלום<br>האוטובוס שלך מספר ${sum.serial_number_Bus} נשלף ע"י חברת  ${availableVehiclesIsExist.dataValues.company.name}<br> מחיר: ${sum.price}<br> הערת החברה: ${sum.description}<h3></h3></h2>`, "הזמנה נשלפה")


    return "הזמנה נשלפה"


  } catch (err) {
    if (err instanceof BuscalError)
      throw err
    throw new Error(`Can't send summary: ${err.message}`)
  }
}

const getCustomerAvailableVehiclesAndNoOneTook = async (query, userId) => {
  try {
    let filter = {
      active: '0',
      expired: '1'
    };
    
    const myCompany = await customers_companies.findOne({where:{customer_id: userId}})

    var AvailableVehicle = await available_vehicles.findOne({
      where: {
        company_id: myCompany.company_id
      }
    });

    let hasNext = false, hasPrev = false;
    if (!AvailableVehicle) {
      AvailableVehicle = []
      return { AvailableVehicle, hasNext, hasPrev }
    }


    Object.assign(filter, {
      'company_id': AvailableVehicle.company_id
    });
    let availableVehicles = await available_vehicles.findAll({
      include: [
        {
          model: vehicle,
          include: [{
            model: vehicle_type
          }
          ],
        },
        {
          model: companies,
        },
        {
          model: closed_available_vehicles
        },
        {model: customers}
      ],
      where: filter,
      order:
        [
          ['start_date', 'ASC'],
          ['start_hour', 'ASC']
        ],
      offset: (parseInt(query.page) - 1) * parseInt(query.size),
      limit: parseInt(query.size) + 1,

    });

    let avs = availableVehicles.filter((av) => {
      return av.closed_available_vehicles.length == 0;
    })
    availableVehicles = avs;

    availableVehicles = availableVehicles.map((order) => {
      return {
        id: order.id,
        serial_number: order.encrypted_id,
        customerName: order.customer.first_name + ' ' + order.customer.last_name ,
        startDate: order.start_date,
        endDate: order.end_date,
        capacity: order.vehicle.capacity,
        vehicleType: order.vehicle.vehicle_type.type

      }
    })

    if (availableVehicles.length > query.size) {
      hasNext = true;
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    availableVehicles = availableVehicles.slice(0, availableVehicles.length);
    return { availableVehicles, hasNext, hasPrev };

  } catch (error) {
    throw new Error(`Can't get orders: ${error.message}`);
  }


}



module.exports = {
  getAvailableVehicles,
  getAvailableVehicle,
  CreateAvailableVehicle,
  editAvailableVehicles,
  deleteAvailableVehicles,
  getCustomerComapnyAllAvailableVehicles,
  getClosedAvailableVehicles,
  closingOnVehicleSummary,
  getCustomerAvailableVehiclesAndNoOneTook,
  getClosedAvailableVehiclesCustomer
}

