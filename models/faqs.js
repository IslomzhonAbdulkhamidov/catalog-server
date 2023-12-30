const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const faqs = new Schema({
    socialNetwork: {
        instagram: {
            url: String,
            active: Boolean
        },
        facebook: {
            url: String,
            active: Boolean
        },
        telegram: {
            url: String,
            active: Boolean
        },
        vk:  {
            url: String,
            active: Boolean
        }
    },
    userAgreement: {
        text: String,
        acticve: String
    },
    goal: {
        text: String,
        active: Boolean
    },
    about: {
        text: String,
        active: Boolean
    },
    admin: {
        tel: String,
        active: String
    },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Faqs', faqs);
