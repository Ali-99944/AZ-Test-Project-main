const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitizer = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp');  
const compression = require('compression');
const cors = require('cors');


const AppError = require('./utils/appError')
const globalErorrHandler = require('./controllers/errorController')
const productsRouter = require('./routes/productsRoutes');
const usersRouter = require('./routes/usersRoutes');
const categoriesRouter = require('./routes/categoriesRoutes')
const subCategoriesRouter = require('./routes/subCategoriesRoutes')
const reviewsRouter = require('./routes/reviewsRoutes')
const cartRouter = require('./routes/cartRoutes')

const app = express();
// app.enable('trust proxy')
// -1) Global MiddleWares
app.use(cors())
// Set security http headers
app.use(helmet())

// development logging
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// limit requests from same IP
const limiter = rateLimit({
    max:900,
    windowMs:60 * 60 * 1000,
    message:'Too many requests from this IP , please try again in an hour!',
})
app.use('/api',limiter)

// Body parser, reading data from the body into req.body
app.use(express.json({limit:'10kb'}));
// Data sanitization against NoSQL query injection 
app.use(mongoSanitizer());
// Data sanitization against XSS 
app.use(xss())
//// prevent parameter pollution (filtring on query )
app.use(hpp({
    whitelist:[
        'rating',
        'price'
    ]
}))
// serving static files
app.use(express.static(`${__dirname}/public`));

app.use(compression())

/// test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();    
    next();
})

app.use('/api/v1/helloMessage',(req,res,next)=>{
    res.status(200).send('Hello from the server')
    next()
})

app.use('/api/v1/categories',categoriesRouter)
app.use('/api/v1/sub-categories',subCategoriesRouter)
app.use('/api/v1/products',productsRouter)
app.use('/api/v1/users',usersRouter)
app.use('/api/v1/reviews',reviewsRouter)
app.use('/api/v1/cart',cartRouter)


// this middleware route will send a Json fail response to the client instead of sending html response fail
// this middleware route should always be in the end of the code to execute in case of URL was wrong only, if we put it on the top of the code will be execute always even if the Url is correct
app.all('*', (req,res,next)=>{
next(new AppError(`Can not find ${req.originalUrl}`,404))
})

app.use(globalErorrHandler)


module.exports = app;