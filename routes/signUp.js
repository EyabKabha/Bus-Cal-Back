var express = require('express');
var router = express.Router();
const signUpController = require('../controllers/signUp')
const { authRoles} = require('../middleware/authCookie')
const { BuscalError } = require('../models/Errors');

router.post('/', async function (req, res, next) {

  try {
    const cookie = req.cookies.buscal
    if (cookie) {
        const user = JSON.parse(cookie);
    signUp = await signUpController.signUp(req.body, user.id)
    }
    else 
      signUp = await signUpController.signUp(req.body, 0)
    res.status(200).json(signUp);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(201).json(err.message)
    res.status(500).json(err.message)
  }
});

router.post('/wait', async function (req, res, next) {

  try {
    signUp = await signUpController.SignUpWait(req.body)
    res.status(200).json(signUp);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(201).json(err.message)
    res.status(500).json(err.message)
  }
});

router.post('/confirm_waiting_customer', authRoles(1, 7), async function (req, res, next) {

  try {
    signUp = await signUpController.confirmSignUp(req.body.id)
    res.status(200).json(signUp);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

router.delete('/refuse_waiting_customer', authRoles(1, 7), async function (req, res, next) {

  try {
    signUp = await signUpController.refuseSignUp(req.body.id)
    res.status(200).json(signUp);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

router.post('/confirmEmail', async function (req, res, next) {
  try {
    const code = await signUpController.confirmEmail(req.body.email)
    res.status(200).json(code);
  } catch (err) {
    res.status(500).json(err.message)
  }
})

router.post('/confirmPhone', async function (req, res, next) {
  try {
    const code = await signUpController.confirmPhone(req.body.companyphone)
    res.status(200).json(code);
  } catch (err) {
    res.status(500).json(err.message)
  }
})

// http://localhost:3001/signup/first_file/:id
router.get('/first_file/:id', async function (req, res, next) {
  try {
    const files = await signUpController.loadWaitingFiles(req.params.id)
    res.download(files[0].path, 'user-facing-filename.pdf')
  } catch (err) {
    res.status(500).json(err.message)
  }
});

// http://localhost:3001/signup/second_file/:id
router.get('/second_file/:id', async function (req, res, next) {
  try {
    const files = await signUpController.loadWaitingFiles(req.params.id)
    res.download(files[1].path)
  } catch (err) {
    res.status(500).json(err.message)
  }
});
module.exports = router;
