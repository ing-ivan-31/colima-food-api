const Address = require('../models/Address');

class AddressRepository
{
    constructor()
    {

    }

    /**
     *
     * @param id
     * @returns {Query|void|number|never|bigint|T|T}
     */
    getAddresses(id)
    {
        return Address.find({user_id: id})
    }

    /**
     *
     * @param address
     * @param id
     * @returns {*}
     */
    saveAddress(address, id)
    {
        address.user_id = id;
        const model = new Address(address);
        return model.save();
    }

    /**
     *
     * @param id
     * @returns {Query}
     */
    deleteAddress(id)
    {
        return Address.findByIdAndRemove(id);
    }

}

module.exports = new AddressRepository();
