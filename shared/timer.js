var schedule = require('node-schedule');
const { Op } = require("sequelize");

const { orders, available_vehicles } = require('../models');

const checkOrders = schedule.scheduleJob('0 0 * * *', async () => {
  try {


    await orders.update({
      active: '0',
      expired: '1'
    }, {
      returning: true, where: {
        start_date: {
            [Op.between]: ['1970-04-11', new Date()]
          
        },
        expired: '0'
      }
    });
  } catch (error) {
    throw new Error(`Can't get orders: ${error.message}`);
  }


});

const checkavailableVehicles = schedule.scheduleJob('0 0 * * *', async () => {
  try {
    await available_vehicles.update({
      active: '0',
      expired: '1'
    }, {
      returning: true, where: {
        start_date: {
            [Op.between]: ['1970-04-11', new Date()]          
        },
        expired: '0'        
      }
    });
  } catch (error) {
    throw new Error(`TIMER ERROR: ${error.message}`);
  }


});

module.exports = { checkOrders, checkavailableVehicles };
