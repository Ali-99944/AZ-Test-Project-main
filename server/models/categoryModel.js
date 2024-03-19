const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name:{ 
        en:{
        type:String,
        required:true
    },
    ar:{
        type:String,
        required:true
    }
        },
                  imageCover:{
                     type:String,
                     required:false
                  }
})

const Category = mongoose.model('Category',categorySchema) 

module.exports = Category;
