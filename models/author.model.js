const mongoose = require('mongoose');
const { DateTime } = require('luxon');

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
    return `/catalog/author/${this._id}`;
  });

authorSchema.virtual('date_of_birth_formatted')
  .get(function () {
    return this.date_of_birth ?
      DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED)
      : '?';
  })

authorSchema.virtual('date_of_death_formatted')
  .get(function () {
    return this.date_of_death ?
      DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
      : '?';
  })

authorSchema.virtual('lifespan')
  .get(function () {
    const dateOfBirth = this.date_of_birth ?
      DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED)
      : '?';

    const dateOfDeath = this.date_of_death ?
      DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
      : '?';

    return `${dateOfBirth} - ${dateOfDeath}`;
  })

authorSchema.virtual('date_of_birth_isodate')
  .get(function () {
    return DateTime.fromJSDate(this.date_of_birth).toISODate();
  });

authorSchema.virtual('date_of_death_isodate')
  .get(function () {
    return DateTime.fromJSDate(this.date_of_death).toISODate();
  })

module.exports = mongoose.model('Author', authorSchema);