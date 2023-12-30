const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const brandSchema = new Schema({
  name: String,
  logo: String,
  websiteUrl: String, // Link to official website of a brand
  series: [String],
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Brand', brandSchema);
