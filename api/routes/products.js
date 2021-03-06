const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null, './uploads/');
    },
    filename: function (req,file,cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    }else{
        cb(null, false);
    }    
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter
});



const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.find().select('name price _id productImage').exec().then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return {
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    _id: doc.id,
                    request: {
                        type: 'GET',
                        url: `http://localhost:5000/products/${doc.id}`
                    }
                }
            })
        };
        console.log(docs);
        // if (docs.length >= 0) {
        res.status(200).json(response);
        // } else {
        //     res.status(404).json({message: 'No entries found'});
        // }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
});

router.post('/', upload.single('productImage'),(req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Created product successfully',
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result.id,
                request: {
                    type: 'GET',
                    url: `http://localhost:5000/products/${result.id}`
                }
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id).select('name price _id').exec().then(doc => {
        console.log('From database', doc);
        if (doc) {
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    description: 'Get all products',
                    url: 'http://localhost:5000/products'
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

router.patch("/:productId", (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product updated',
                request: {
                    type: 'GET',
                    url: `http://localhost:5000/products/${id}`
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

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id }).exec().then(product => {
        if(!product){
            return res.status(404).json({message:'Product not found'});
        }
        res.status(200).json({
            message: 'Product deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:5000/products',
                data: {
                    name: 'String',
                    price: 'Number'
                }
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
});
module.exports = router;