const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },items:[
        {
            product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    quantity:{
        type:Number,
        required:true
        }
    }
],
 // status mean if the order confirmed , paid etc.
    status:{
            type:Number,
            required:true
        }
})

const Order = mongoose.model('Order',orderSchema) 

module.exports = Order;