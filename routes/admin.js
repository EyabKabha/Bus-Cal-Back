var express = require('express');
var router = express.Router();
const adminController = require('../controllers/admin')
const { authRoles } = require('../middleware/authCookie');
const {BuscalError} = require('../models/Errors');


/* GET admin settings. */
router.get('/', authRoles(1, 7), async function (req, res, next) {
  try {
    const result = await adminController.getVehiclesAndTrips()
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

/* GET all orders. */
router.get('/orders', authRoles(1, 2, 7), async function (req, res, next) {
  try {
    const result = await adminController.getOrders()
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

/* GET all waiting orders for specific customer. */
router.get('/waiting_orders/:id', authRoles(1, 2, 7), async function (req, res, next) {
  try {
    const result = await adminController.getOrdersCustomer(req.params.id)
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

/* GET all waiting av for specific customer. */
router.get('/waiting_available_vehicles/:id', authRoles(1, 2, 7), async function (req, res, next) {
  try {
    const result = await adminController.getAVCustomer(req.params.id)
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

/* GET all available vehicles. */
router.get('/available_vehicles', authRoles(1, 2, 7), async function (req, res, next) {
  try {
    const result = await adminController.getAV()
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

/* GET admin employees' roles. */
router.get('/roles', authRoles(1, 7), async function (req, res, next) {
  try {
    const roles = await adminController.getRoles(req.userId)
    res.status(200).json(roles);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

//POST admin new vehicle
router.post('/newVehicle', authRoles(1, 7), async function (req, res, next) {
  try {
    const result = await adminController.addVehicle(req.body)
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

//POST admin new trip
router.post('/newtrip', authRoles(1, 7), async function (req, res, next) {
  try {
    const result = await adminController.addTrip(req.body)
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

//Verify password
router.post('/password', authRoles(1, 7), async function (req, res, next) {
  try {
    const result = await adminController.verifyPassword(req.body.password, req.userId)
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(201).json(err.message)
    res.status(500).json(err.message)
  }
});

//Delete specific vehicle
router.delete('/vehicle/:id', authRoles(1, 7), async function (req, res, next) {
  try {
    const result = await adminController.deleteVehicle(req.params.id)
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(201).json(err.message)
    res.status(500).json(err.message)
  }
});


//Delete specific trip
router.delete('/trip/:id', authRoles(1, 7), async function (req, res, next) {
  try {
    const result = await adminController.deleteTrip(req.params.id)
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(201).json(err.message)
    res.status(500).json(err.message)
  }
});


module.exports = router;