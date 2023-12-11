const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const { Schema, model } = mongoose;

const bookInstanceSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['available', 'maintenance', 'loaned', 'reserved'],
    default: 'maintenance'
  },
  due_back: { type: Date, default: Date.now },
});

// virtual properties
bookInstanceSchema.virtual('url')
  .get(function () { return `/catalog/bookinstance/${this._id}` });

bookInstanceSchema.virtual('due_back_formatted')
  .get(function () {
    return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
  })

module.exports = model('BookInstance', bookInstanceSchema);