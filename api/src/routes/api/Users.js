//Schema
let express = require('express');
let router = express.Router();
const authentication = require('../../services/authentication');
const Users = require('../../models/User');
let httpStatus = require('../../constants/httpStatus');
const basePath = '';

// Create
router.post(basePath, authentication.required, (req, res) => {
    const { body: { user } } = req;

    if (!user) {
        return res.status(httpStatus.BAD_REQUEST).json({
            errors: 'Bad request -Empty Body',
            status: httpStatus.BAD_REQUEST
        });
    }

    if(!user.email) {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
            errors: {
                email: 'is required',
                status: httpStatus.UNPROCESSABLE_ENTITY
            },
        });
    }

    if(!user.password) {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
            errors: {
                password: 'is required',
                status: httpStatus.UNPROCESSABLE_ENTITY
            },
        });
    }

    const model = new Users(user);
    model.setPassword(user.password);

    return model.save()
        .then(() => res.status(httpStatus.CREATED).json({user: model.toAuthJSON()}))
        .catch( error => {
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json( { error: objError } );
        });
});

// Update
router.put(basePath, authentication.required, (req, res) => {
    const { body: { user } } = req;

    if (!user.id) {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
            errors: {
                user: 'is required',
                status: httpStatus.UNPROCESSABLE_ENTITY
            },
        });
    }

    Users.findByIdAndUpdate(id, user,{
        new: true
    })
        .then((user) => {
            return res.json({ user: user })
        })
        .catch( error => {
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json( { error: objError } );
        });
});

// Delete
router.delete(basePath, authentication.required,  (req, res) => {
    const { payload: { id }} = req;

    if (!id) {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).send({
            errors: {
                user: 'is required',
                status: httpStatus.UNPROCESSABLE_ENTITY
            },
        });
    }

    Users.findByIdAndRemove(id)
        .then(user => {
            return res.status(httpStatus.DELETE_CONTENT).json({ user: user  })
        })
        .catch( error => {
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json( { error: objError } );
        });
});


// GEt ALL
router.get(basePath, authentication.required, (req, res, next) => {
    return Users.find()
        .then((users) => {
            if (!users) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).send({
                    errors: {
                        users: 'not found',
                        status: httpStatus.UNPROCESSABLE_ENTITY
                    },
                });
            }
            return res.json({ users: users })
        })
        .catch( error => {
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json( { error: objError });
        });
});

//GET current route (required, only authenticated users have access)
router.get('/current', authentication.required, (req, res, next) => {
    const { payload: { id } } = req;

    return Users.findById(id)
        .then((user) => {
            if(!user) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    errors: 'Bad request -Empty Body',
                    status: httpStatus.BAD_REQUEST
                });
            }
            return res.json({user: user });
        })
        .catch( error => {
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(objError);
        });
});


//Get by Id
router.get('/:id', authentication.required, (req, res, next) => {
    const { params: { id }  } = req;
    return Users.findById(id)
        .then((user) => {
            if (!user) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).send({
                    errors: {
                        user: 'not found',
                        status: httpStatus.UNPROCESSABLE_ENTITY
                    },
                });
            }
            return res.json({ user: user })
        })
        .catch( error => {
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json( { error: objError });
        });
});

module.exports = router;
