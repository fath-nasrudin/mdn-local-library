const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'Author', required: true }, // referencing to Author object id
  summary: { type: String, required: true },
  isbn: { type: String, required: true },
  genre: [{ type: Schema.Types.ObjectId, ref: 'Genre' },]
});

// virtual properties
bookSchema.virtual('url')
  .get(function () { return `/catalog/book/${this._id}` });

module.exports = mongoose.model('Book', bookSchema);