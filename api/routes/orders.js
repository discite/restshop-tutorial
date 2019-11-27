const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

// Handle incoming GET requests to /orders
router.get('/', (req, res, next) => {
    Order.find().populate('product', 'name').select('product quantity _id').exec().then(docs=>{
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return {
                    product: doc.product,
                    quantity: doc.quantity,
                    _id: doc.id,
                    request: {
                        type: 'GET',
                        url: `http://localhost:5000/orders/${doc.id}`
                    }
                }
            })
        };
        res.status(200).json(response);
    }).catch(err=>{
        res.status(500).json({error:err});
    });
});

router.post("/", (req, res, next) => {
    Product.findById(req.body.productId)
      .then(product => {
        if (!product) {
          return res.status(404).json({
            message: "Product not found"
          });
        }
        const order = new Order({
          _id: mongoose.Types.ObjectId(),
          quantity: req.body.quantity,
          product: req.body.productId
        });
        return order.save();
      })
      .then(result => {
        console.log(result);
        res.status(201).json({
          message: "Order stored",
          createdOrder: {
            _id: result._id,
            product: result.product,
            quantity: result.quantity
          },
          request: {
            type: "GET",
            url: "http://localhost:5000/orders/" + result._id
          }
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });

router.get('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id).populate('product').select('product quantity _id').exec().then(doc => {
        console.log('From database', order);
        if (order) {
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    description: 'Get all orders',
                    url: 'http://localhost:5000/orders'
                }
            });
        } else {
            res.status(404).json({ message: "No valid entry found for provided ID" });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
});

router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.remove({ _id: id }).exec().then(order => {
        if(!order){
            return res.status(404).json({message:'Order not found'});
        }
        res.status(200).json({
            message: 'Order deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:5000/orders',
                data: {
                    productId: 'ID',
                    quantity: 'Number'
                }
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
});

module.exports = router;