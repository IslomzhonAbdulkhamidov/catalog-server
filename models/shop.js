const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shopSchema = new Schema({
  firebaseId: String,
  name: String,
  email: String,
  activated: {
    type: Boolean,
    default: false,
  },
  logo: String,
  contact: String,
  address: String,
  websiteUrl: String,
  littleInfo: String,
  createdDate: {type: Date, default: Date.now},
  updatedDate: {type: Date, default: Date.now},
});

module.exports = mongoose.model('Shop', shopSchema);
