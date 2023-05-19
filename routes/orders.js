var express = require('express');
var router = express.Router();
const ordersController = require('../controllers/orders')
const {customer, authRoles} = require('../middleware/authCookie')
const { BuscalError } = require('../models/Errors');

router.get('/getusercompanyordersandonetookthem', authRoles(5, 6), async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 20000;

  query = Object.assign({}, {
    size, 
    page
  });
  try {
    const orders = await ordersController.getCompanyOrdersAndOneTookThem(query, req.userId)
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err.message)
  }
});
router.get('/getusercompanyordersandnoonetookthem', authRoles(5, 6), async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 2000;

  query = Object.assign({}, {
    size, 
    page
  });
  try {
    const orders = await ordersController.getCompanyOrdersAndNoOneTookThem(query, req.userId)
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err.message)
  }
});
// get orders
router.get('/getuserordersandnoonetookthem', customer, async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 2000;

  query = Object.assign({}, {
    size, 
    page
  });
  try {
    const orders = await ordersController.getUserOrdersAndNoOneTookThem(query, req.userId)
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

router.get('/getuserordersandonetookthem', customer, async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 2000;

  query = Object.assign({}, {
    size, 
    page
  });
  try {
    const orders = await ordersController.getUserOrdersAndOneTookThem(query, req.userId)
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

// edit order
router.put('/:id', authRoles(1, 2, 4, 5, 6, 7), async function (req, res, next) {
  try {
    const updatedOrder = await ordersController.editOrder(req.body, req.params.id)
    res.status(200).json(updatedOrder);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

// delete order
router.delete('/:id', authRoles(1, 2, 4, 5, 6, 7), async function (req, res, next) {
  try {
    const deletedOrder = await ordersController.deleteOrder(req.params.id)
    res.status(200).json(deletedOrder);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

// get orders
router.get('/report', authRoles(1, 2, 4, 5, 6, 7), async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 2000;

  query = Object.assign({}, {
    size, 
    page
  });
  try {
    const orders = await ordersController.getUserOrders(query, req.userId)
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

// get orderDetails to show in bid
router.get('/order_details', authRoles(1, 2, 4, 5, 6, 7), async function (req, res, next) {

  try {
    const orderDetails = await ordersController.getOrderDetails()
    res.status(200).json(orderDetails);
  } catch (err) {
    res.status(500).json(err.message)
  }
});


// get orders for customer
router.get('/waiting_orders', customer, async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 2000;
  query = Object.assign({}, {
    size, 
    page
  });
  try {
    const orders = await ordersController.getUserWaitingOrders(query, req.userId)
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

router.get('/company_waiting_orders', authRoles(5, 6), async function (req, res, next) {
  const page = req.query.page || 1;
  const size = req.query.size || 2000;
  query = Object.assign({}, {
    size, 
    page
  });
  try {
    const orders = await ordersController.getCompanyWaitingOrders(query, req.userId)
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

router.get('/:id', authRoles(1, 2, 4, 5, 6, 7), async function (req, res, next) {
  try{
    const order = await ordersController.getOrder(req.params.id)
    res.status(200).json(order);
  } catch (err) {
    if (err instanceof BuscalError)
      res.status(200).json(err.message)
    res.status(500).json(err.message)
  }
});

// Create new order
router.post('/', authRoles(4,5,6), async function (req, res, next) {
  try {
    const newOrder = await ordersController.CreateOrder(req.body, req.userId)
    res.status(200).json(newOrder);
  } catch (err) {
    res.status(500).json(err.message)
  }
});

module.exports = router;
