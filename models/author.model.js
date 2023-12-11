const mongoose = require('mongoose');

const { Schema } = mongoose;

const authorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: Date,
  date_of_death: Date,
})

// virtual properties

authorSchema.virtual('name')
  .get(function () {
    let fullname = '';
    if (this.first_name) fullname += this.first_name;
    if (fullname && this.family_name) fullname += ' ';
    if (this.family_name) fullname += this.family_name;
    return fullname;
  });

authorSchema.virtual('url')
  .get(function () {
    return `catalog/author/${this._id}`;
  });


module.exports = mongoose.model('Author', authorSchema);