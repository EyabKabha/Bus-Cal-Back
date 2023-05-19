var express = require('express');
var router = express.Router();
const fs = require('fs');
const { BuscalError } = require('../models/Errors');

const ordersController = require('../controllers/orders')
const customersController = require('../controllers/customers')
const availableVehiclesController = require('../controllers/availableVehicles')
const companiesController = require('../controllers/companies')
const { authRoles, adminCompany } = require('../middleware/authCookie')
const upload = require('../services/files-upload')


// // get COMPANY available vehicles
router.get('/customer_company_available_vehicles', authRoles(5, 6), async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 2000;
  const startDate = req.query.startdate || 'all';
  const endDate = req.query.enddate || 'all';
  const startTime = req.query.starttime || 'all';
  const endTime = req.query.endtime;


  query = Object.assign({}, {
    size,
    page,
    startDate,
    endDate,
    startTime,
    endTime,
  });
  try {
    const vehicles = await availableVehiclesController.getCustomerComapnyAllAvailableVehicles(query, req.userId)
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

router.delete('/company_employee/:id', adminCompany, async function (req, res, next) {
  try {
    const companyEmployee = await companiesController.deleteCompanyEmployee(req.params.id)
    res.status(200).json(companyEmployee);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

router.put('/company_employee/:id', adminCompany, async function (req, res, next) {
  try {
    console.log(req.body, req.params.id)
    const companyEmployee = await companiesController.editCompanyEmployee(req.body, req.params.id)
    res.status(200).json(companyEmployee);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(201).json(err.message)
    else
      res.status(500).json(err.message)
  }
});

router.get('/company_employee/:id', adminCompany, async function (req, res, next) {
  try {
    const companyEmployee = await companiesController.getCompanyEmployee(req.params.id, req.userId)
    res.status(200).json(companyEmployee);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

const multi_upload = upload.array('files')

// /* upload new companies files. */
router.post('/upload_files/:id', multi_upload, async function (req, res, next) {
  try {

    const companyFiles = await companiesController.uploadCompanyFiles(req.files, req.params.id)
    res.status(200).json(companyFiles);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

// /* upload new companies files. */
router.post('/direct_upload_files/:id', multi_upload, async function (req, res, next) {
  try {
    const companyFiles = await companiesController.directUploadCompanyFiles(req.files, req.params.id)
    res.status(200).json(companyFiles);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

router.post('/vehicle_summary', authRoles(5, 6), async function (req, res, next) {

  try {
    console.log(req.body)
    const result = await availableVehiclesController.closingOnVehicleSummary(req.body, req.userId)
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(201).json(err.message)
    res.status(500).json(err.message)
  }
});

/* GET specific order listing. */
router.get('/order/:id', authRoles(1, 2, 5, 6, 7), async function (req, res, next) {
  try {
    const order = await ordersController.getOrder(req.params.id)
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

/* GET orders listing. */
router.get('/orders', authRoles(1, 2, 5, 6, 7), async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 2000;
  const startDate = req.query.startdate || 'all';
  const endDate = req.query.enddate || 'all';
  const startTime = req.query.starttime || 'all';
  const endTime = req.query.endtime || 'all';;
  const startPoint = req.query.startpoint || 'all';
  const destination = req.query.destination || 'all';
  const tripType = req.query.triptype || 'all';
  const capacity = req.query.capacity || 'all';
  const vehicleType = req.query.vehicletype || 'all';
  const extra = req.query.extra || 'all';
  const stopStations = req.query.stopstations || 'all';

  query = Object.assign({}, {
    size,
    page,
    startDate,
    endDate,
    startTime,
    endTime,
    startPoint,
    destination,
    tripType,
    capacity,
    vehicleType,
    extra,
    stopStations
  });
  try {
    const orders = await ordersController.getOrders(query, req.userId)
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

// // Create new available vehicle
router.post('/available_vehicles', authRoles(5, 6), async function (req, res, next) {
  try {

    const vehicles = await availableVehiclesController.CreateAvailableVehicle(req.body, req.userId)
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

// // edit available vehicle
router.put('/available_vehicles/:id', authRoles(1, 2, 5, 6, 7), async function (req, res, next) {
  try {
    const vehicles = await availableVehiclesController.editAvailableVehicles(req.body, req.params.id)
    res.status(200).json(vehicles);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

// // delete available vehicle
router.delete('/available_vehicles/:id', authRoles(1, 2, 5, 6, 7), async function (req, res, next) {
  try {
    const vehicles = await availableVehiclesController.deleteAvailableVehicles(req.params.id)
    res.status(200).json(vehicles);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

// // get available vehicles
router.get('/available_vehicles', authRoles(1, 2, 5, 6, 7), async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 2000;
  const startDate = req.query.startdate || 'all';
  const endDate = req.query.enddate || 'all';
  const startTime = req.query.starttime || 'all';
  const endTime = req.query.endtime || 'all';
  const capacity = req.query.capacity || 'all';
  const vehicleType = req.query.vehicletype || 'all';


  query = Object.assign({}, {
    size,
    page,
    startDate,
    endDate,
    startTime,
    endTime,
    vehicleType,
    capacity
  });
  try {
    const vehicles = await availableVehiclesController.getAvailableVehicles(query, req.userId)
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json(err.message)
  }
});
// // get available vehicle
router.get('/available_vehicles/:id', authRoles(1, 2, 5, 6, 7), async function (req, res, next) {

  try {
    const vehicles = await availableVehiclesController.getAvailableVehicle(req.params.id)
    res.status(200).json(vehicles);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});



// // get COMPANY available vehicles
router.get('/customer_available_vehicles_expired', authRoles(5, 6), async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 2000;

  query = Object.assign({}, {
    size,
    page

  });
  try {
    const vehicles = await availableVehiclesController.getCustomerAvailableVehiclesAndNoOneTook(query, req.userId)
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

router.post('/userCompany', adminCompany, async function (req, res, next) {

  try {
    console.log(req.body)
    const newCustomer = await customersController.createNewUserCompany(req.body, req.userId)
    res.status(200).json(newCustomer);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(201).json(err.message)
    else
      res.status(500).json(err.message)
  }
});

router.post('/summary', authRoles(5, 6), async function (req, res, next) {

  try {
    console.log(req.body)
    const result = await companiesController.summary(req.body, req.userId)
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(201).json(err.message)
    res.status(500).json(err.message)
  }
});


// // get the closed available vehicles (i'm the supllier)
router.get('/closed_available_vehicles_by_my_company', authRoles(5, 6), async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 2000;
  const startDate = req.query.startdate || 'all';
  const endDate = req.query.enddate || 'all';
  const startTime = req.query.starttime || 'all';
  const endTime = req.query.endtime;


  query = Object.assign({}, {
    size,
    page,
    startDate,
    endDate,
    startTime,
    endTime,

  });
  try {
    const vehicles = await availableVehiclesController.getClosedAvailableVehicles(query, req.userId)
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

// get the closed available vehicles (i'm the customer) (i made request)
router.get('/closed_available_vehicles_by_my_company_customer', authRoles(5, 6), async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 2000;
  const startDate = req.query.startdate || 'all';
  const endDate = req.query.enddate || 'all';
  const startTime = req.query.starttime || 'all';
  const endTime = req.query.endtime;

  query = Object.assign({}, {
    size,
    page,
    startDate,
    endDate,
    startTime,
    endTime,

  });
  try {
    const vehicles = await availableVehiclesController.getClosedAvailableVehiclesCustomer(query, req.userId)
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json(err.message)
  }
});


// // get COMPANY employees
router.get('/employees', adminCompany, async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 2000;

  query = Object.assign({}, {
    size,
    page
  });
  try {
    const employees = await companiesController.getCompanyEmployees(query, req.userId)
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

// // get the closed  orders for the company
router.get('/get_closed_orders_by_my_company', authRoles(5, 6), async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 2000;

  query = Object.assign({}, {
    size,
    page
  });
  try {
    const closed_orders = await ordersController.getClosedOrdersByMyCompany(query, req.userId)
    res.status(200).json(closed_orders);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

// // get the closed  orders for the company
router.get('/closed_orders', authRoles(5, 6), async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 2000;

  query = Object.assign({}, {
    size,
    page
  });
  try {
    const closed_orders = await ordersController.getCompanyClosedOrders(query, req.userId)
    res.status(200).json(closed_orders);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

// // get the closed  order with serial number for the company
router.get('/closed_orders/:serial', authRoles(5, 6), async function (req, res, next) {
  try {
    const closed_orders = await ordersController.getCompanyClosedOrderById(req.params.serial)
    res.status(200).json(closed_orders);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

// // get company files location in amazon
// http://localhost:3001/companies/load_files/:id
router.get('/load_files/:id', async function (req, res, next) {
  try {
    const files = await companiesController.loadCompanyFiles(req.params.id)
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

// http://localhost:3001/companies/load_waiting_files/:id
router.get('/load_waiting_files/:id', async function (req, res, next) {
  try {
    const files = await companiesController.loadWaitingCompanyFiles(req.params.id)
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json(err.message)
  }
});





module.exports = router;
