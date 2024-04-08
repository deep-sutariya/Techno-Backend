const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationListSchema = new Schema({
    address: { type: String, required: true },
    postal_code: { type: String, required: false },
    country: { type: String, required: false },
    region: { type: String, required: false },
    area: { type: String, required: false },
    locality: { type: String, required: false },
    sublocality: { type: String, required: false },
    neighborhood: { type: String, required: false },
    location: {
        lat: { type: Number, required: false },
        lng: { type: Number, required: false }
    },
    location_type: { type: String, required: false },
    type: { type: String, required: false },
    lastNotificationSentAt: { type: Date, default: null }
}, { timestamps: false });


module.exports = mongoose.model('LocationList', LocationListSchema);