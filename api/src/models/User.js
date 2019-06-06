const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Schema } = mongoose;
const Mailer = require("../services/mailer");

const UsersSchema = new Schema({
    first_name: String,
    last_name: String,
    email: {
        type: String,
        required: true,
        unique:true
    },
    phone_number: {
        type: String,
        unique:true
    },
    hash: String,
    salt: String,
    activated: {
        type: Number,
        default: 0
    },
    token_confirmation: String,
    token_reset: String,

}, { timestamps:true });

UsersSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    this.token_confirmation = crypto.randomBytes(16).toString('hex');
};

UsersSchema.methods.changePassword = function(token, password) {
    let salt = crypto.randomBytes(16).toString('hex');
    let hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');

    return this.model('Users').findOneAndUpdate({
            token_reset: token,
        },
        {
            token_reset: '',
            salt: salt,
            hash: hash,
            activated: 1
        },
        {
            new: true, // return updated doc
        });
};

UsersSchema.methods.validatePassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

UsersSchema.methods.generateJWT = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    const timeExpiration = Number(process.env.TIME_EXPIRATION);
    expirationDate.setDate(today.getDate() + timeExpiration); // expiration in days

    return jwt.sign({
        email: this.email,
        id: this._id,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
    }, process.env.JWT_SECRET);
};

const sendEmail = (email, token_confirmation) => {
    let mailer = new Mailer();
    mailer.setEmailOptions({
        from: '"Bienvenido a Colima food" <welcome@colimafood.com>',
        to: email,
        subject: 'Bienvenido a Colima food',
        text: 'Bienvenido a Colima food, Estamos emocionados en darte la bienvenida a partir de hoy solo da click en el link para terminar el proceso de activacion de cuenta. ',
        html: '<b>Bienvenido a Colima food! </b><p>Estamos emocionados en darte la bienvenida a partir de hoy solo da click en el link para terminar el proceso de activacion de cuenta <br> <a href="' + process.env.CLIENT_APP_HOST + '/account/active/' + token_confirmation + '">Activa tu Cuenta</a> <br/> </p>',
        attachments: []
    });
    mailer.send();
};

UsersSchema.methods.toAuthJSON = function(create) {
    let fullname = 'Usuario';
    if (typeof  this.first_name !== 'undefined' && typeof  this.last_name !== 'undefined') {
        fullname = this.first_name + ' ' + this.last_name;
    }

    if (create) {
        sendEmail(this.email, this.token_confirmation);
    }

    return {
        _id: this._id,
        email: this.email,
        token: this.generateJWT(),
        first_name: this.first_name,
        last_name: this.last_name,
        phone_number: this.phone_number,
        full_name: fullname
    };
};

module.exports = mongoose.model('Users', UsersSchema);

