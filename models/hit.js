const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hitSchema = new Schema({
  defaultPhoneId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'DefaultPhone',
  },
  ip: String
});

module.exports = mongoose.model('Hit', hitSchema);
