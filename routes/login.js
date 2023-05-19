var express = require('express');
var router = express.Router();
const loginController = require('../controllers/login')
const { BuscalError } = require('../models/Errors');

router.post('/employees', async function (req, res, next) {
  try {
    const logedin = await loginController.employeesLogin(req.body)
    res.cookie('buscal', JSON.stringify(logedin), { maxAge: 1000 * 60 * 60 * 24 * 7 });
    res.status(200).json({ role: logedin.role, firstname: logedin.first_name, lastname: logedin.last_name });
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

router.post('/customers', async function (req, res, next) {
  try {
    const logedin = await loginController.customersLogin(req.body)
    res.cookie('buscal', JSON.stringify(logedin), { maxAge: 1000 * 60 * 60 * 24 * 7 });
    res.status(200).json({ role: logedin.role, firstname: logedin.first_name, lastname: logedin.last_name });
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

router.post('/reset_password', async function (req, res, next) {
  try {
    const reset = await loginController.resetPassword(req.body.email)
    res.status(200).json(reset);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

router.put('/reset_password', async function (req, res, next) {
  try {
    const update = await loginController.updatePassword(req.body)
    res.status(200).json(update);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

module.exports = router;
