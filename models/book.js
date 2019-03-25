
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const BookSchema = new Schema(
  {
    title: {type: String, required: true},
    authors: [{type: Schema.Types.ObjectId, ref: 'Author', required: true}],
    summary: {type: String, required: true},
    isbn: {type: String, required: true},
    genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}]
  }
);


// Virtual for book's URL
// BookSchema
// .virtual('url')
// .get(function () {
//   return '/catalog/book/' + this._id;
// });
BookSchema.virtual('url').get(() => '/catalog/book/' + this._id);





BookModel = mongoose.model('Book', BookSchema);
//Export model
module.exports = BookModel;