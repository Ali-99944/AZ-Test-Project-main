const { response } = require('../app');
const Cart = require('../models/cartModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync')
const factory = require('../controllers/handlerFactory')

// exports.createCart = catchAsync(async (req,res,next)=>{
// const cart
// })


exports.getUserCart = catchAsync(async (req,res,next) => {
    const userId = req.params.productID
    const cart = await Cart.findOne({userId});

if(!cart) {
    return next(new AppError('User does not have a cart OR (Cart is Empty)',404));
}
res.status(200).json({
    status: 'success',
    data:{
        cart: cart
    }
})
})

exports.addToCart = catchAsync(async (req,res,next) => {
    const UserID = req.user.id;
    const productID = req.body.product;
    const quantity = req.body.quantity;
    let cart = await Cart.findOne({ user: UserID });
    if(!cart) {
        cart = await Cart.create({
            user: UserID,
            items:[{product:productID, quantity:quantity}]
        })
        
    } else{
        const  exitingItem = cart.items.find(item => item.product.toString() === productID);
        if(exitingItem) {
            exitingItem.quantity = quantity;
        } else{
            cart.items.push({product:productID, quantity:quantity});
        }
    }
   await cart.save();
    res.status(200).json({
        status: 'item added successfully',
        data:{
            cart: cart
        }
    })
})

exports.deleteItemFromCart = catchAsync(async (req,res,next) =>{
    const userId = req.user.id
    const productId = req.body.product

    const cart = await Cart.findOne({user: userId})
    if(!cart) {
return next(new AppError('Cart not found',404))
    } else {
        cart.items = cart.items.filter((item) => item.product.toString() !== productId)
        await cart.save();
    }
    res.status(200).json({
        status: 'item removed successfully',
        data: cart
    })
})
exports.updateItemsQuantity = catchAsync(async (req,res,next) =>{
    const userID = req.user.id;
    const productID = req.body.product;
    const quantity = req.body.quantity;

    const cart = await Cart.findOne({user: userID})

    const itemToUpdate = cart.items.find(item => item.product.toString() === productID) 
    if (itemToUpdate){
        itemToUpdate.quantity =  quantity;
        await cart.save();
        res.status(200).json({
            status: 'item updated successfully',
            data: cart
        })
    } else{
        return next(new AppError("Item not found in the cart",404));
    }

})
exports.removeCart = catchAsync(async (req,res,next) =>{
    const userID = req.user.id; 
    const cart = await Cart.findOneAndRemove({user: userID});
    if(!cart) {
        return next(new AppError("Cart not found",404));
    } else {
        res.status(204).json()
    }
})

exports.emptyCart = catchAsync(async (req,res,next) =>{
    const userID = req.user.id; 
    const cart = await Cart.findOne({user: userID});
     if(!cart){
        return next(new AppError("Cart not found",404));
     } else {
        cart.items = []
        await cart.save();
        res.status(200).json({
            status: 'success',
            data: {cart}
        })
     }
})
