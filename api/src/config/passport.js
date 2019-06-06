const passport = require('passport');
const LocalStrategy = require('passport-local');
const Users = require('../models/User');

passport.use(new LocalStrategy({
    usernameField: 'user[email]',
    passwordField: 'user[password]',
}, (email, password, done) => {
    Users.findOne(
        {
            email: email
        })
        .then((user) => {
            if(!user || !user.validatePassword(password)) {
                return done(null, false, {  message : 'Tus credenciales estan incorrectas.' });
            }
            if (user.activated == false) {
                return done(null, false, {  message : 'Tu cuenta no ha sido activada.' });
            }

            return done(null, user);
        }).catch(done);
}));