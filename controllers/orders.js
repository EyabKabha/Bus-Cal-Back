const { orders, customers, vehicle, companies, extra_orders, extra, stop_stations_orders, vehicle_type, trip, customers_companies, closed_orders } = require('../models')
const { Op } = require("sequelize");
const { orderValidation } = require('../middleware/validations');
const Sequelize = require('sequelize');
const { BuscalError } = require('../models/Errors');
const { encryptID } = require("./encrypt")
//  http://localhost:3001/companies/orders?startdate=2020-04-09&enddate=2020-04-18&starttime=22:00:00&endtime=21:00:00//
// &startpoint=jatt&destination=haifa&triptype=מתמשכת&capacity=55&vehicletype=אוטובוס&extra=מדריך,מלווה,חובש
// &?stopstations=haifa,acre,baqa

const getOrders = async (query, userId) => {
  let filter = {
    active: 1,
    expired: 0
  };
  if (query.startDate != 'all') {
    startDate = query.startDate;
    endDate = '3020-04-11';
    if (query.endDate != 'all') {
      endDate = query.endDate;
    }
    startDate = new Date(startDate)
    endDate = new Date(endDate)
    if (endDate === startDate) {
      startDate = new Date(startDate)
      Object.assign(filter, {
        'start_date': startDate
      });
    } else {
      Object.assign(filter, {
        'start_date': {
          [Op.between]: [startDate, endDate]
        }
      });
    }
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


  if (query.destination != 'all') {
    Object.assign(filter, {
      destination: query.destination
    });
  }

  if (query.startPoint != 'all') {
    Object.assign(filter, {
      start_point: query.startPoint
    });
  }

  let Model = [{
    model: customers,
    attributes: ['first_name', 'last_name', 'phone', 'email'],
    include: {
      model: companies,
      attributes: ['subscription'],
    }

  }
  ];

  let tripType, capacity, vehicleType, whereExtras, whereStopStations;
  if (query.tripType != 'all') {
    tripType = Object.assign({}, {
      type: query.tripType
    });
    Model.push({
      model: trip,
      where: tripType,
    })
  }
  if (query.capacity != 'all') {
    capacity = Object.assign({}, {
      capacity: query.capacity
    });
  }
  if (query.vehicleType != 'all') {
    vehicleType = Object.assign({}, {
      type: query.vehicleType
    });
  }
  Model.push({
    model: vehicle,
    where: capacity,
    include: [{
      model: vehicle_type,
      where: vehicleType
    }
    ]
  })

  if (query.extra != 'all') {
    

    let extras = query.extra.split(',');
    whereExtras = Object.assign({}, {
      name:
      {
        [Op.in]: extras
      }
    });
    Model.push(
      {
        model: extra_orders,
        include: [{
          model: extra,
          where: whereExtras
        }]
      })
  }

  if (query.stopStations != 'all') {
    let stations = query.stopStations.split(',');
    whereStopStations = Object.assign({}, {
      station:
      {
        [Op.in]: stations
      }
    });
    Model.push({
      model: stop_stations_orders,
      where: whereStopStations
    })
  }

  try {
    const myCompany = await customers_companies.findOne({ where: { customer_id: userId } })
    var companyusers = await customers_companies.findAll({ where: { company_id: myCompany.company_id } })
    companyusers = companyusers.map(usr => {
      return usr.customer_id
    })

    Object.assign(filter, {
      customer_id: {
        [Op.notIn]: companyusers
      }
    });
    let otherOrders = await orders.findAll({
      where: filter,
      include: [
        ...Model
      ],

      order:
        [
          ['start_date', 'ASC'],
          ['start_hour', 'ASC']
        ],
      offset: (parseInt(query.page) - 1) * parseInt(query.size),
      limit: parseInt(query.size) + 1,

    });

    Object.assign(filter, {
      customer_id: {
        [Op.in]: companyusers
      }
    });

    let myOrders = await orders.findAll(
      {
        where: filter,
        include: [
          ...Model
        ],

        order:
          [
            ['start_date', 'ASC'],
            ['start_hour', 'ASC']
          ],
        offset: (parseInt(query.page) - 1) * parseInt(query.size),
        limit: parseInt(query.size) + 1,
      })

    if (query.vehicleType != 'all') {
      otherOrders = otherOrders.filter((order) => {
        return order.vehicle != null;
      })
    }

    myOrders = myOrders.map((order) => {
      return {
        id: order.id, serial_number: order.encrypted_id, start_point: order.start_point,
        destination: order.destination
        , customerFirstName: order.customer.first_name, customerLastName: order.customer.last_name,
        customerPhone: order.customer.phone, customerEmail: order.customer.email,
        subscription: order.customer.companies
      };
    })

    otherOrders = otherOrders.map((order) => {
      return {
        id: order.id, serial_number: order.encrypted_id, start_point: order.start_point,
        destination: order.destination
        , customerFirstName: order.customer.first_name, customerLastName: order.customer.last_name,
        customerPhone: order.customer.phone, customerEmail: order.customer.email,
        subscription: order.customer.companies
      };
    })


    let hasNext = false, hasPrev = false;
    if (myOrders.length > query.size) {
      hasNext = true;
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    myOrders = myOrders.slice(0, query.size);
    let res = {
      myOrders: {
        orders: myOrders, hasNext, hasPrev
      }
    }
    hasNext = false, hasPrev = false;
    if (otherOrders.length > query.size) {
      hasNext = true;
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    otherOrders = otherOrders.slice(0, query.size);

    res.otherOrders = {
      orders: otherOrders, hasNext, hasPrev
    }
    return res;

  } catch (error) {
    throw new Error(`Can't get orders: ${error.message}`);
  }


}


//http://localhost:3001/companies/order/1
const getOrder = async (id) => {
  try {
    const order = await orders.findOne({
      attributes: ['start_date', 'end_date', 'start_point', 'destination', 'start_hour', 'end_hour', 'description', 'vehicle_id'],
      where: {
        id: id
      },
      include: [{
        model: customers,
        attributes: ['first_name', 'last_name', 'phone']
      },
      {
        model: trip
      },
      {
        model: stop_stations_orders
      },
      {
        model: extra_orders,
        include: [{
          model: extra,
        }
        ],
      }
      ],

    });

    if (!order) throw new BuscalError('הזמנה לא קיימת')

    const vehicleOfOrder = await vehicle.findOne({
      where: {
        id: order.vehicle_id
      },
      attributes: ['id', 'capacity'],
      include: [{
        model: vehicle_type,
        attributes: ['type'],
      }
      ],

    });

    const stops = order.stop_stations_orders.map((stop) => {
      return {
        id: stop.id,
        name: stop.station,
        sequence: stop.sequence
      }
    });

    const extras = order.extra_orders.map((extra) => {
      return extra.extra.id;

    });

    const Order = {
      start_date: order.start_date, end_date: order.end_date, start_point: order.start_point,
      destination: order.destination, start_hour: order.start_hour, end_hour: order.end_hour, description: order.description
      , customerFirstName: order.customer.first_name, customerLastName: order.customer.last_name,
      customerPhone: order.customer.phone, tripType: order.trip, vehicleType: vehicleOfOrder, stopStations: stops, extra: extras
    };
    return Order;
  } catch (err) {
    if (err instanceof BuscalError)
      throw err
    throw new Error(`Can't get order: ${error.message}`);
  }
}


const CreateOrder = async (order, userId) => {

  try {
    const validationResult = await Joi.validate(order, orderValidation);
    if (!validationResult) {
        return 'data not valid '+validationResult;
    }

    orders.addHook('afterCreate', (newOrder, options) => {

      orders.update({
          encrypted_id: encryptID((newOrder.id).toString())
      }, { where: { id: newOrder.id } })
  })

    const newOrder = await orders.create({
      customer_id: userId,
      vehicle_id: order.vehicle_id,
      trip_id: order.trip_id,
      start_date: order.start_date,
      end_date: order.end_date,
      start_point: order.start_point,
      destination: order.destination,
      start_hour: order.start_hour,
      end_hour: order.end_hour,
      description: order.description
    })

    if (order.stop_stations.length)
      updateStopStationOrders(order.stop_stations, newOrder.id)
    if (order.extra.length)
      updateExtraOrder(order.extra, newOrder.id)

    return "נוצר בהצלחה"
  } catch (err) {
    throw new Error(`Can't create order: ${err.message}`)
  }
}
const editOrder = async (order, orderId) => {

  try {
    // const validationResult = await Joi.validate(order, orderValidation);
    // if (!validationResult) {
    //     return 'data not valid '+validationResult;
    // }

    const orderIsExist = await orders.findOne({
      where: {
        id: orderId, active: 1
      },
    });

    if (!orderIsExist)
      throw new BuscalError("הזמנה לא קיימת או פג תוקפה או נשלפה")

    await orders.update({
      vehicle_id: order.vehicle_id,
      trip_id: order.trip_id,
      start_date: order.start_date,
      end_date: order.end_date,
      start_point: order.start_point,
      destination: order.destination,
      start_hour: order.start_hour,
      end_hour: order.end_hour,
      description: order.description
    }, { returning: true, where: { id: orderId } });

    stop_stations_orders.destroy(
      { where: { order_id: orderId } })

    if (order.stop_stations.length)
      updateStopStationOrders(order.stop_stations, orderId)


    extra_orders.destroy(
      { where: { order_id: orderId } })

    if (order.extra.length)
      updateExtraOrder(order.extra, orderId)


    return "עודכן בהצלחה"
  } catch (err) {
    if (err instanceof BuscalError)
      throw err
    throw new Error(`Can't update order: ${error.message}`);
  }
}

const deleteOrder = async (orderId) => {

  try {
    const checkOrderExistenes = await orders.findOne({
      where: {
        id: orderId, active: 1
      },
    });

    if (!checkOrderExistenes)
      throw new BuscalError("הזמנה לא קיימת או נשלפה כבר")

    await stop_stations_orders.destroy(
      { where: { order_id: orderId } });

    await extra_orders.destroy(
      { where: { order_id: orderId } });

    await closed_orders.destroy(
      { where: { order_id: orderId } });

    await orders.destroy(
      { where: { id: orderId } });

    return "נמחק בהצלחה"
  } catch (err) {
    if (err instanceof BuscalError)
      throw err
    throw new Error(`Can't delete order: ${error.message}`);
  }
}

const updateStopStationOrders = async (stop_stations, orderId) => {

  try {
    var stopStations = [];
    for (var i = 0; i < stop_stations.length; i++) {
      var station = {
        order_id: orderId,
        station: stop_stations[i].name,
        sequence: stop_stations[i].sequence
      }
      stopStations.push(station);
    }

    await stop_stations_orders.bulkCreate(stopStations, { returning: true });

  }
  catch (error) {
    throw new Error(`Can't create stop stations: ${error.message}`);
  }

}


const updateExtraOrder = async (extra, orderId) => {

  try {
    var Extra = [];
    for (var i = 0; i < extra.length; i++) {
      var ext = {
        extra_id: extra[i],
        order_id: orderId
      }
      Extra.push(ext);
    }

    await extra_orders.bulkCreate(Extra, { returning: true });

  }
  catch (error) {
    throw new Error(`Can't create extra orders: ${error.message}`);
  }

}

const getUserOrders = async (query, userId) => {
  try {
    let Allorders = await orders.findAll({
      where: {
        customer_id: userId,
        active: '0'
      },
      order:
        [
          ['start_date', 'ASC'],
          ['start_hour', 'ASC']
        ],
      offset: (parseInt(query.page) - 1) * parseInt(query.size),
      limit: parseInt(query.size) + 1,

    });


    let ordersList = Allorders.map((order) => {
      OrderElement = {
        id: order.id, start_point: order.start_point,
        destination: order.destination
        , active: order.active, expired: order.expired
      };
      return OrderElement;

    })


    let hasNext = false, hasPrev = false;
    if (ordersList.length > query.size) {
      hasNext = true;
      ordersList = ordersList.slice(0, query.size);
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    return { ordersList, hasNext, hasPrev };

  } catch (error) {
    throw new Error(`Can't get orders: ${error.message}`);
  }


}

//http://localhost:3001/orders/waiting_orders
const getUserWaitingOrders = async (query, userId) => {
  try {
    let Allorders = await orders.findAll({
      where: {
        active: '1',
        expired: '0',
        customer_id: userId,
      },
      order:
        [
          ['start_date', 'ASC'],
          ['start_hour', 'ASC']
        ],
      offset: (parseInt(query.page) - 1) * parseInt(query.size),
      limit: parseInt(query.size) + 1,

    });

    let ordersList = Allorders.map((order) => {
      OrderElement = {
        id: order.id, serial_number: order.encrypted_id, start_point: order.start_point,
        destination: order.destination
      };
      return OrderElement;

    })

    let hasNext = false, hasPrev = false;
    if (ordersList.length > query.size) {
      hasNext = true;
      ordersList = ordersList.slice(0, query.size);
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    return { ordersList, hasNext, hasPrev };

  } catch (error) {
    throw new Error(`Can't get orders: ${error.message}`);
  }


}

//http://localhost:3001/orders/company_waiting_orders
const getCompanyWaitingOrders = async (query, userId) => {
  try {
    const customersCompanies = await customers_companies.findOne({
      where: {
        customer_id: userId
      }
    });

    let Allorders = await orders.findAll({
      where: {
        active: '1',
        expired: '0',
      },
      include: [
        {
          model: customers,
          include: [{
            model: companies,
            where: {
              id: customersCompanies.company_id
            }
          }
          ],

        },
        {
          model: vehicle,
          include: [{
            model: vehicle_type
          }
          ],
        },
        {
          model: trip,
          // include: [{
          //   model: tripType,

          // }
          // ],
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


    let ordersList = Allorders.map((order) => {
      OrderElement = {
        id: order.id, serial_number: order.encrypted_id, start_point: order.start_point,
        destination: order.destination, vehicle: order.vehicle.vehicle_type.type,
        capacity: order.vehicle.capacity, trip: order.trip.type,
        customerName: order.customer.first_name + ' ' + order.customer.last_name,
        customerPhone: order.customer.phone
      };
      return OrderElement;

    })


    let hasNext = false, hasPrev = false;
    if (ordersList.length > query.size) {
      hasNext = true;
      ordersList = ordersList.slice(0, query.size);
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    return { ordersList, hasNext, hasPrev };
  } catch (error) {
    throw new Error(`Can't get orders: ${error.message}`);
  }
}

const getOrderDetails = async () => {
  try {
    const Extras = await extra.findAll()
    const Trips = await trip.findAll()
    const Vehicles = await vehicle.findAll({
      attributes: ['id', 'capacity'],
      include: [{
        model: vehicle_type,
        attributes: ['type']
      }]
    })

    return {
      Extras,
      Vehicles,
      Trips
    }

  } catch (err) {
    throw new Error(`Can't get order details: ${err.message}`)
  }
}
 // מיותרת
const getCompanyClosedOrders = async (query, userId) => {
  try {
    let company = await customers_companies.findOne({
      where: {
        customer_id: userId
      }
    })

    let closedOrders = await closed_orders.findAll({
      where: {
        company_id: company.company_id,
      },
      include: [
        {
          model: customers,

          include: [{
            model: companies,
            where: {
              id: company.company_id
            }
          }
          ],
        }
        , {
          model: orders,
        }
      ],
      offset: (parseInt(query.page) - 1) * parseInt(query.size),
      limit: parseInt(query.size) + 1,

    });
    // return closedOrders;
    let closed = closedOrders.map((order) => {
      return {
        serial_number: order.order.encrypted_id,
        customerName: order.customer.first_name + ' ' + order.customer.last_name,
        companyName: order.customer.companies[0].name,
        orderStartDate: order.order.start_date,
        orderEndDate: order.order.end_date,
        start_point: order.order.start_point,
        destination: order.order.destination,
      }
    })

    let hasNext = false, hasPrev = false, res;
    res = closed;
    if (closed.length > query.size) {
      hasNext = true;
      res = closed.slice(0, query.size);
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    return { closed, hasNext, hasPrev };

  } catch (error) {
    throw new Error(`Can't get company closed orders: ${error.message}`);
  }

}

// closed orders that my company took them from customers
const getClosedOrdersByMyCompany = async (query, userId) => {
  try {
    let company = await customers_companies.findOne({
      where: {
        customer_id: userId
      }
    })

    let closedOrders = await closed_orders.findAll({
      where: {
        company_id: company.company_id
      },
      include: [
        {
          model: customers,

          include: [{
            model: companies
          }
          ],
        },
        {model: customers, as:'userCompany',
        include: [{
          model: companies
        }
        ]}
        , {
          model: orders,
        }
      ],
      offset: (parseInt(query.page) - 1) * parseInt(query.size),
      limit: parseInt(query.size) + 1,

    });
      // return closedOrders;
    let closed = closedOrders.map((order) => {
      return {
        serial_number: order.order.encrypted_id,
        customerName: order.customer.first_name + ' ' + order.customer.last_name,
        userCompanyName: order.userCompany.first_name + ' ' + order.userCompany.last_name,
        orderStartDate: order.order.start_date,
        orderEndDate: order.order.end_date,
        start_point: order.order.start_point,
        destination: order.order.destination,
      }
    })

    let hasNext = false, hasPrev = false, res;
    res = closed;
    if (closed.length > query.size) {
      hasNext = true;
      res = closed.slice(0, query.size);
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    return { closed, hasNext, hasPrev };

  } catch (error) {
    throw new Error(`Can't get company closed orders: ${error.message}`);
  }

}
// מיותרת
const getCompanyClosedOrderById = async (serial) => {
  try {


    const order = await orders.findOne({
      where:{
        encrypted_id: serial
      }
    })

    if(!order) throw new BuscalError(`הזמנה לא קיימת`)

    let closedOrder = await closed_orders.findOne({
      where: {
        order_id: order.id,
      },
      include: [
        {
          model: customers,
          include: [{
            model: companies
          }
          ],

        }
        , {
          model: orders,
          include: [{
            model: customers
          }],
        }
      ]
    });

    if(!closedOrder) return new BuscalError(`הזמנה לא קיימת`)

    let closed = {
      serial_number: closedOrder.order.encrypted_id,
      employeeName: closedOrder.customer.first_name + ' ' + closedOrder.customer.last_name,//לא נכון
      companyName: closedOrder.customer.companies[0].name,
    }

    return closed;

  } catch (error) {
    if(error instanceof BuscalError)
      throw error
    throw new Error(`Can't get company closed order: ${error.message}`);
  }


}

const getUserOrdersAndNoOneTookThem = async (query, userId) => {
  try {
    let Allorders = await orders.findAll({
      where: {
        customer_id: userId,
        active: '0',
        expired: '1',

      },
      include: [
        {
          model: closed_orders,
        }
      ],
      order:
        [
          ['start_date', 'ASC'],
          ['start_hour', 'ASC']
        ],
      offset: (parseInt(query.page) - 1) * parseInt(query.size),
      limit: parseInt(query.size) + 1

    });

    let ordersList = Allorders.filter((order) => {
      return order.closed_orders.length == 0;
    })


    ordersList = ordersList.map((order) => {
      OrderElement = {
        id: order.id,
        serial_number: order.encrypted_id, 
        start_point: order.start_point,
        destination: order.destination, 
        active: order.active, 
        expired: order.expired,
        start_date: order.start_date, 
        end_date: order.end_date
      };
      return OrderElement;

    })

    let hasNext = false, hasPrev = false, res;
    res = ordersList;
    if (ordersList.length > query.size) {
      hasNext = true;
      res = ordersList.slice(0, query.size);
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    return { ordersList, hasNext, hasPrev };

  } catch (error) {
    throw new Error(`Can't get orders: ${error.message}`);
  }
}

const getUserOrdersAndOneTookThem = async (query, userId) => {
  try {
    let Allorders = await orders.findAll({
      where: {
        customer_id: userId,
        active: '0',

      },
      include: [
        {
          model: closed_orders,
          include: [{model:companies}]
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

    let ordersList = Allorders.filter((order) => {
      return order.closed_orders.length > 0;
    })

// console.log(ordersList[0].closed_orders[0].company.name)
    ordersList = ordersList.map((order) => {
      OrderElement = {
        id: order.id,
        serial_number: order.encrypted_id, 
        start_point: order.start_point,
        destination: order.destination, 
        active: order.active, 
        expired: order.expired,
        start_date: order.start_date, 
        end_date: order.end_date,
        companyName: order.closed_orders[0].company.name
      };
      return OrderElement;

    })

    let hasNext = false, hasPrev = false, res;
    res = ordersList;
    if (ordersList.length > query.size) {
      hasNext = true;
      res = ordersList.slice(0, query.size);
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    return { ordersList, hasNext, hasPrev };

  } catch (error) {
    throw new Error(`Can't get orders: ${error.message}`);
  }
}

const getCompanyOrdersAndNoOneTookThem = async (query, userId) => {
  try {
    const customersCompanies = await customers_companies.findOne({
      where: {
        customer_id: userId
      }
    });

    let Allorders = await orders.findAll({
      where: {
        active: '0',
        expired: '1',
      },
      include: [
        {
          model: closed_orders,
        },
        {

          model: customers,
          include: [{
            model: companies,
            where: {
              id: customersCompanies.company_id
            }
          }
          ],

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

    let ordersList = Allorders.filter((order) => {
      return order.closed_orders.length == 0;
    })

    ordersList = ordersList.map((order) => {
      OrderElement = {
        id: order.id, serial_number: order.encrypted_id, start_point: order.start_point,
        destination: order.destination, startDate: order.start_date,
        endDate: order.end_date, customerName: order.customer.first_name + ' ' + order.customer.last_name
      };
      return OrderElement;

    })


    let hasNext = false, hasPrev = false, res;
    res = ordersList;
    if (ordersList.length > query.size) {
      hasNext = true;
      res = ordersList.slice(0, query.size);
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    return { ordersList, hasNext, hasPrev };

  } catch (error) {
    throw new Error(`Can't get orders: ${error.message}`);
  }


}

const getCompanyOrdersAndOneTookThem = async (query, userId) => {
  try {
    const customersCompanies = await customers_companies.findOne({
      where: {
        customer_id: userId
      }
    });

    let Allorders = await orders.findAll({
      where: {
        active: '0',
      },
      include: [
        {
          model: closed_orders, include:[{model: companies}]
        },
        {

          model: customers,
          include: [{
            model: companies,
            where: {
              id: customersCompanies.company_id
            }
          }
          ],

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

    let ordersList = Allorders.filter((order) => {
      return order.closed_orders.length > 0;
    })

    ordersList = ordersList.map((order) => {
      OrderElement = {
        id: order.id, 
        serial_number: order.encrypted_id,
        customerName: order.customer.first_name + ' ' + order.customer.last_name, 
        companyName: order.closed_orders[0].company.name, 
        start_point: order.start_point,
        destination: order.destination, 
        startDate: order.start_date,
        endDate: order.end_date
      };
      return OrderElement;

    })


    let hasNext = false, hasPrev = false, res;
    res = ordersList;
    if (ordersList.length > query.size) {
      hasNext = true;
      res = ordersList.slice(0, query.size);
    }
    if (query.page != 1) {
      hasPrev = true;
    }
    return { ordersList, hasNext, hasPrev };

  } catch (error) {
    throw new Error(`Can't get orders: ${error.message}`);
  }


}
module.exports = {
  getUserOrdersAndOneTookThem,
  getCompanyOrdersAndOneTookThem,
  getCompanyOrdersAndNoOneTookThem,
  getUserOrdersAndNoOneTookThem,
  getOrders,
  getOrder,
  CreateOrder,
  editOrder,
  deleteOrder,
  getUserOrders,
  getUserWaitingOrders,
  getCompanyWaitingOrders,
  getOrderDetails,
  getCompanyClosedOrders,
  getCompanyClosedOrderById,
  getClosedOrdersByMyCompany
}

