var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//schema
var Users = new Schema({
    desc: {
        type: String
    },
},{
    collection: 'Tasks'
});

module.exports = mongoose.model('Users', Users);
