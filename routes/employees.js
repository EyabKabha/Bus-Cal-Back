var express = require('express');
var router = express.Router();
const employeesController = require('../controllers/employees')
const upload = require('../services/files-upload')
const {sale, authRoles} = require('../middleware/authCookie')
const { BuscalError } = require('../models/Errors');

const multi_upload = upload.array('files')

// /* upload new employee files. */
router.post('/upload_employee_files/:id',multi_upload , async function(req, res, next) {
  try{
    const employee = await employeesController.uploadEmployeeFiles(req.files, req.params.id)
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

// // get employee files by employee id
// http://localhost:3001/employees/load_files/:id
router.get('/load_files/:id', async function (req, res, next) {
  try {
    const files = await employeesController.loadEmployeeFiles(req.params.id)
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json(err.message)
  }
});



/* GET customers listing. */
router.get('/createdBySales', sale, async function (req, res, next) {
  try {
    const page = req.query.page || 1;
    const size = req.query.size || 2000;
    query = Object.assign({}, {
      size, 
      page
    });
    const customers = await employeesController.getCustomersCreatedBy(req.userId, query)
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json(err.message)
  }
});


/* GET employees listing. */
router.get('/', authRoles(1, 7), async function (req, res, next) {
  try {
    const employees = await employeesController.getEmployees()
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

/* GET employees listing by identity. */
router.post('/specific', authRoles(1, 7), async function (req, res, next) {
  try {
    const employees = await employeesController.getEmployeesByIdentity(req.body.identity)
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json(err.message)
  }
});


/* GET employee details (עריכת פרטים אישיים) */
router.get('/myDetails', authRoles(1, 2, 3, 7), async function (req, res, next) {
  try {
    const emp = await employeesController.getmyDetails(req.userId)
    res.status(200).json(emp);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

/* update employee details (עריכת פרטים אישיים) */
router.put('/myDetails', authRoles(1, 2, 3, 7), async function (req, res, next) {
  try {
    const emp = await employeesController.updatemyDetails(req.body, req.userId)
    res.status(200).json(emp);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});


/* GET specific employee. */
router.get('/:id', authRoles(1, 7), async function (req, res, next) {
  try {
    const employee = await employeesController.getEmployee(req.params.id)
    res.status(200).json(employee);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

/* Create new employee. */
router.post('/', authRoles(1, 7), async function (req, res, next) {
  try {
    const employee = await employeesController.createEmployee(req.body)
    res.status(200).json(employee);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(201).json(err.message)
    res.status(500).json(err.message)
  }
});



/* edit existed employee. */
router.put('/:id', authRoles(1, 7), async function (req, res, next) {
  try {
    const employee = await employeesController.editEmployee(req.body, req.params.id)
    res.status(200).json(employee);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

/* delete employee. */
router.delete('/:id', authRoles(1, 7), async function (req, res, next) {
  try {
    const employee = await employeesController.deleteEmployee(req.params.id)
    res.status(200).json(employee);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

module.exports = router;
