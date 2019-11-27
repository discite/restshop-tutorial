const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/user');

router.post("/signup", (req, res, next) => {
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: req.body.password,
    })    
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