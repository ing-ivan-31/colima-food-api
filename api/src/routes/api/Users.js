//Schema
let express = require('express');
let router = express.Router();
const auth = require('../auth');
const passport = require('passport');
const Users = require('../../models/User');
const basePath = '';

//Login
router.post('/login',  auth.optional, (req, res, next) => {
    const { body: { user } } = req;

    if(!user.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if(!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
        if(err) {
            return next(err);
        }

        if(passportUser) {
            const user = passportUser;
            user.token = passportUser.generateJWT();

            return res.json({ user: user.toAuthJSON() });
        }
        return res.status(401).send(info);
    })(req, res, next);
});

// Create
router.post(basePath, auth.optional, (req, res) => {
    const { body: { user } } = req;

    if (!user) {
        return res.status(400).send('Bad request - Empty body');
    }

    if(!user.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if(!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    const model = new Users(user);
    model.setPassword(user.password);

    return model.save()
        .then(() => res.status(201).json({ user: model.toAuthJSON()}))
        .catch( error => {
            console.log(error)
            return res.status(500).json(error)
        });
});

// Update
router.put(basePath, auth.required, (req, res) => {
    const { payload: { id },  body: { user }  } = req;

    if (!id) {
        return res.status(422).send('User does not exist');
    }

    Users.findByIdAndUpdate(id, user,{
        new: true
    })
        .then((user) => {
            return res.json(user)
        })
        .catch( error => {
            return res.status(500).json(error)
        });
});

// Delete
router.delete(basePath, auth.required,  (req, res) => {
    const { payload: { id },  body: { user }  } = req;

    if (!id) {
        return res.status(422).send('User does not exist');
    }

    Users.findByIdAndRemove(id)
        .then(doc => {
            return res.json(doc)
        })
        .catch( error => {
            return res.status(500).json(error)
        });
});


// GEt ALL
router.get('', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    return Users.find()
        .then((users) => {
            if (!users) {
                return res.sendStatus(400);
            }
            return res.json({users})
        })
        .catch( error => {
                return res.status(500).json(error)
        });
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    return Users.findById(id)
        .then((user) => {
            if(!user) {
                return res.sendStatus(400);
            }
            return res.json({ user: user.toAuthJSON() });
        })
        .catch( error => {
            return res.status(500).json(error)
        });
});

module.exports = router;
