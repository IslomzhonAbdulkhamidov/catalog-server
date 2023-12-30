const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const banner = new Schema({
  uid: String,
  isActive: Boolean,
  isMain: Boolean,
  isSingle: Boolean,
  bannerUrl: String,
  isButtonActive: Boolean,
  buttonUrl: String,
  newTab: Boolean,
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Banner', banner);
