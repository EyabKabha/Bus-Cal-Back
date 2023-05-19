var express = require('express');
var router = express.Router();
const customersController = require('../controllers/customers')
const { authRoles, admin } = require('../middleware/authCookie')
const { BuscalError } = require('../models/Errors');

/* GET customers listing. */
router.get('/', authRoles(1, 2, 7), async function (req, res, next) {
  try {
    const page = req.query.page || 1;
    const size = req.query.size || 2000;
    query = Object.assign({}, {
      size,
      page
    });
    const customers = await customersController.getCustomers(query)
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

/* GET all waiting customers. */
router.get('/waiting', authRoles(1, 7), async function (req, res, next) {
  try {
    const customers = await customersController.getWaitingCustomers()
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

/* GET waiting customer by id. */
router.get('/waiting/:id', authRoles(1, 7), async function (req, res, next) {
  try {
    const customer = await customersController.getWaitingCustomer(req.params.id)
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

/* GET customer details (עריכת פרטים אישיים) */
router.get('/myDetails', authRoles(4, 5, 6), async function (req, res, next) {
  try {
    const customer = await customersController.getmyDetails(req.userId)
    res.status(200).json(customer);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

/* update customer details (עריכת פרטים אישיים) */
router.put('/myDetails', authRoles(4, 5, 6), async function (req, res, next) {
  try {
    const customer = await customersController.updatemyDetails(req.body, req.userId)
    res.status(200).json(customer);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

/* GET specific customer . */
router.get('/:id', authRoles(1, 2, 7), async function (req, res, next) {
  try {
    const customer = await customersController.getCustomer(req.params.id)
    res.status(200).json(customer);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});


router.put('/:id', authRoles(1, 2, 7), async function (req, res, next) {
  try {
    const customer = await customersController.editCustomer(req.body, req.params.id)
    res.status(200).json(customer);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

router.delete('/waiting/:id', authRoles(1, 7), async function (req, res, next) {
  try {
    const customer = await customersController.deleteWaitingCustomer(req.params.id)
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

router.delete('/:id', authRoles(1, 7), async function (req, res, next) {
  try {
    const customers = await customersController.deleteCustomer(req.params.id)
    res.status(200).json(customers);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

module.exports = router;
