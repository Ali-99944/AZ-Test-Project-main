const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
name:{ en:{
   type:String,
   required:true
},
ar:{
   type:String,
       required:true
}
},
       category:{type:mongoose.Schema.Types.ObjectId,
                 ref:'Category',
                required:true},
                 imageCover:{
                    type:String,
                    required:false
                 }
})

const SubCategory = mongoose.model('SubCategory',subCategorySchema) 

module.exports = SubCategory;
