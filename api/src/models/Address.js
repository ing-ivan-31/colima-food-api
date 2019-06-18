const mongoose = require('mongoose');
const { Schema } = mongoose;

const AddressSchema = new Schema({
    route: String,
    street_number: String,
    neighborhood: String,
    political: String,
    locality: String,
    administrative_area_level_1: String,
    postal_code: String,
    latitude: String,
    longitude: String,
    place_id: String,
    formatted_address: String,
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }
}, { timestamps:true, toObject: { virtuals: true } ,toJSON: { virtuals: true } });

module.exports = mongoose.model('Adresses', AddressSchema);
