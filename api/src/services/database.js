let mongoose = require('mongoose');

const server = 'mongodb:27017'; // REPLACE WITH YOUR DB SERVER;
const database = process.env.DB_NAME;      // REPLACE WITH YOUR DB NAME

class Database {
    constructor() {
        this._connect()
    }

    _connect() {
        //Configure Mongoose to promises and connect to DB.
        mongoose.promise = global.Promise;
        mongoose.set('debug', true);
        mongoose.connect(`mongodb://${server}/${database}`, { useNewUrlParser: true,  useFindAndModify: false })
            .then(() => {
                console.log('Database connection successful')
            })
            .catch(err => {
                console.error('Database connection error')
            })
    }
}

// Singleton pattern
module.exports = new Database();
