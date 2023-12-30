const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const defaultPhoneSchema = new Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Brand',
  },
  brandName: String,
  screen: String,
  cpu: String,
  camera: String,
  batary: String,
  video: String,
  weight: String,
  series: String, // samsung A, apple iphone, ipad, mi Redmi, mi MI 9
  model: String, // samsung S 20 Ultra (20 ulta <- model)
  images: [String],
  memories: [
    {
      ramStorage: Number,
      memoryStorage: Number,
      isExists: Boolean
    }
  ],
  colors: [
    {
      hex: String, // #ff0000
      name: String, // red
      isExists: Boolean

    }
  ],
  sims: [String],
  producedCountry: [String],
  producedDate: Number,
  operatingSystem: String,
  description: String,
  characteristics: String,
  defaultCreatedDate: {type: Date, default: Date.now},
  defaultUpdatedDate: { type: Date, default: Date.now },
  pageViewCounter: { type: Number, default: 0 }
});


defaultPhoneSchema.index({"model" : "text", "series" : "text", "brandName" : "text"})
console.log(defaultPhoneSchema.indexes())
module.exports = mongoose.model('DefaultPhone', defaultPhoneSchema);
