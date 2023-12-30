const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const phoneSchema = new Schema({
  defaultPhoneId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'DefaultPhone',
  },
  phoneUrl: String,
  isActive: Boolean,
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Shop',
  },
  price: Number,
  currency: String,

  memory:
  {
    ramStorage: Number,
    memoryStorage: Number,
  },
  color:
    [
      {
        hex: String, // #ff0000
        name: String, // red
      }
    ],
  sim: String,
  producedCountry: String,

  phoneCollection: [
    {
      color:[{
        hex: String, // #ff0000
        name: String, // red
      }],
      memory: {
        ramStorage: Number,
        memoryStorage: Number
      },
      price: String,
      country: String

    }
  ],

  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Phone', phoneSchema);
