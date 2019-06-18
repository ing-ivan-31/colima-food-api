//Schema
const express = require('express');
const router = express.Router();
const authentication = require('../../services/authentication');
const httpStatus = require('../../constants/httpStatus');
const AddressRepository = require('../../Repositories/AddressRepository');
const basePath = '';

// Get addresses
router.get(basePath, authentication.required, (req, res, next) => {
    const { payload: { id } } = req;

    AddressRepository
        .getAddresses(id)
        .then((addresses) => {
            return res.json( {addresses: addresses } );
        })
        .catch( error => {
            console.log(error);
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(objError);
        });
});


// Save addresses
router.post(basePath, authentication.required, (req, res, next) => {
    const { body: { address } } = req;
    const { payload: { id } } = req;

    AddressRepository
        .saveAddress(address, id)
        .then((address) => {
            if(!address) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    error: {message: 'Este token no existe en nuestros records.'},
                    status: httpStatus.UNPROCESSABLE_ENTITY
                });
            }
            return res.json( {addresses: address } );
        })
        .catch( error => {
            console.log(error);
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(objError);
        });
});


// Delete address
router.delete('/:id', authentication.required, (req, res, next) => {
    const { params: { id }  } = req;

    AddressRepository
        .deleteAddress(id)
        .then(user => {
            return res.status(httpStatus.DELETE_CONTENT).json({ user: user  })
        })
        .catch( error => {
            const status = {status: httpStatus.INTERNAL_SERVER_ERROR};
            const objError = {...error, ...status};
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(objError);
        });
});


module.exports = router;
