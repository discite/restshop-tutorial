const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const ordersRoutes = require('./api/routes/orders');

mongoose.connect('mongodb://localhost/node_shop', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

//Logger
app.use(morgan('dev'));
// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT','POST','PATCH','DELETE','GET');
        return res.status(200).json({});
    }
    next();
});


// Rutas
app.use('/products', productRoutes);
app.use('/orders', ordersRoutes);

// 404 en caso de no encontrar una ruta
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

// Manejar un error
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        message: error.message,
    });
});

module.exports = app;