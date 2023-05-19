var express = require('express');
var router = express.Router();
const citiesController = require('../controllers/cities')

// Get all cities
router.get('/', async function (req, res, next) {
  try {
    const allCities = await citiesController.getAll()
    res.status(200).json(allCities);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

module.exports = router;
