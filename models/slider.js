const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const slider = new Schema({
_id: String,
subTopic: String,
topic: String,
littleDescription: String,
image: String,
isActive: Boolean,
isButtonActive: Boolean,
buttonUrl: String,
newTab: Boolean,
createdDate: { type: Date, default: Date.now },
updatedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Slider', slider);
