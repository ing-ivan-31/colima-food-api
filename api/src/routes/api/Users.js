//Schema
const express = require('express');
const router = express.Router();
const authentication = require('../../services/authentication');
const Users = require('../../models/User');
const httpStatus = require('../../constants/httpStatus');
const basePath = '';
const Mailer = require("../../services/mailer");
const UserRepository = require('../../Repositories/UserRepository');
const avatarUpload = require('../../config/multer');

/**
 * Get Full Name
 * @param user
 */
const getFullName = (user) => {
    let fullname = {};
    if (typeof  user.first_name !== 'undefined' && typeof  user.last_name !== 'undefined') {
        fullname = {full_name: user.first_name + ' ' + user.last_name};
    }
    else {
        fullname = {full_name: 'Usuario'}
    }
    return fullname;
};

const sendResetEmail = (email, token_reset) => {
    let mailer = new Mailer();
    mailer.setEmailOptions({
        from: '"Resetea tu contrasena" <welcome@colimafood.com>',
        to: email,
        subject: 'Resetea tu contrasena',
        text: 'Se ha realizado una peticion de cambio de contrasena para ' + email + ' Si no haz realizado esta peticion ignora este email. ',
        html: '<p>Se ha realizado una peticion de cambio de contrasena para <b> ' + email + '</b> da click en la siguiente liga para continuar el procesos </b> <br> <a href="' + process.env.CLIENT_APP_HOST + '/account/reset/' + token_reset + '">Cambiar Contrasena</a> <br/> </p>Si no haz realizado esta peticion ignora este email.<p></p>',
        attachments: []
    });
    mailer.send();
};

// Create
router.post(basePath, authentication.optional, (req, res) => {
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
        .then(() => {
            res.status(httpStatus.CREATED).json({user: model.toAuthJSON(true)})
        })
        .catch( error => {
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(objError);
        });
});


/**
 * @route PUT users
 * @desc Update profile data
 * @access public
 */
router.put(basePath, authentication.required, (req, res) => {
    const { payload: { id }} = req;

    if (!id) {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
            errors: {
                user: 'is required',
                status: httpStatus.UNPROCESSABLE_ENTITY
            },
        });
    }

    avatarUpload( req, res, ( error ) => {
        const { body } = req;

        if (error) {
            console.log('errors', error);
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                errors: {
                    user: 'is required',
                    status: httpStatus.UNPROCESSABLE_ENTITY,
                    error: error
                },
            });
        }
        else {

            let imageLocation = process.env.S3_AVATAR_PROFILE_DEFAULT;
            let user = {...body};

            // If File not found
            if (req.file !== undefined) {
                // If Success
                imageLocation = req.file.location;
                user = {...user, avatar: imageLocation};
            }

            // Save the file name into database into profile model
            UserRepository
                .update(id, user)
                .then((user) => {
                    return res.json({user: user})
                })
                .catch(error => {
                    const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
                    const objError = {...error, ...status};
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(objError);
                });
        }
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

    UserRepository
        .delete(id)
        .then(user => {
            return res.status(httpStatus.DELETE_CONTENT).json({ user: user  })
        })
        .catch( error => {
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(objError);
        });
});

// GET ALL
router.get(basePath, authentication.required, (req, res, next) => {

    UserRepository
        .get('')
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
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(objError);
        });
});

//GET current route (required, only authenticated users have access)
router.get('/current', authentication.required, (req, res, next) => {
    const { payload: { id } } = req;

    UserRepository
        .getCurrentSession(id)
        .then((user) => {
            if(!user) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    errors: 'Bad request -Empty Body',
                    status: httpStatus.BAD_REQUEST
                });
            }

            let fullname = getFullName(user);
            const newUSer = {...user._doc, ...fullname};
            return res.json( {user: newUSer } );
        })
        .catch( error => {
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(objError);
        });
});

// Activate account
router.post('/activate', authentication.optional, (req, res, next) => {
    const { body: { user } } = req;

    UserRepository
        .activateAccount(user)
        .then((user) => {
            if(!user) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    error: {message: 'Este usuario ha sido activado o no existe en nuestros registros'},
                    status: httpStatus.UNPROCESSABLE_ENTITY
                });
            }

            let fullname = getFullName(user);
            const newUSer = {...user._doc, ...fullname};
            return res.json( {user: newUSer } );
        })
        .catch( error => {
            console.log(error);
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(objError);
        });
});

// Send email reset account
router.post('/reset/account', authentication.optional, (req, res, next) => {
    const { body: { user } } = req;

    UserRepository
        .setTokenReset(user)
        .then((user) => {
            if(!user) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    error: {message: 'Este usuario no existe en nuestros registros'},
                    status: httpStatus.UNPROCESSABLE_ENTITY
                });
            }
            sendResetEmail(user.email, user.token_reset);
            let fullname = getFullName(user);
            const newUSer = {...user._doc, ...fullname};
            return res.json( {user: newUSer } );
        })
        .catch( error => {
            console.log(error);
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(objError);
        });
});

// Check reset token
router.get('/reset/account/:token', authentication.optional, (req, res, next) => {
    const { params: { token }  } = req;

    UserRepository
        .checkToken(token)
        .then((user) => {
            if(!user) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    error: {message: 'Este token no existe en nuestros records.'},
                    status: httpStatus.UNPROCESSABLE_ENTITY
                });
            }
            return res.json( {user: user } );
        })
        .catch( error => {
            console.log(error);
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(objError);
        });
});

// Send email reset password
router.post('/reset/password/', authentication.optional, (req, res, next) => {
    const { body: { user } } = req;

    UserRepository
        .resetPassword(user.password, user.token_reset)
        .then((user) => {
            if(!user) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    error: {message: 'Este token no existe en nuestros records.'},
                    status: httpStatus.UNPROCESSABLE_ENTITY
                });
            }
            return res.json( {user: user } );
        })
        .catch( error => {
            console.log(error);
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(objError);
        });
});

//Get user by Id
router.get('/:id', authentication.required, (req, res, next) => {
    const { params: { id }  } = req;

    UserRepository
        .get(id)
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
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json( objError );
        });
});

module.exports = router;
