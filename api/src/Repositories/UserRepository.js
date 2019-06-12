const Users = require('../models/User');
const crypto = require('crypto');

class UserRepository
{
    constructor()
    {

    }

    /**
     *
     * @param user
     * @returns {*}
     */
    create(user)
    {
        const model = new Users(user);
        model.setPassword(user.password);
        model.save();

        return model.toAuthJSON(true);
    }

    /**
     *
     * @param id
     * @param user
     * @returns {*}
     */
    update(id, user)
    {
        return Users.findByIdAndUpdate(id, {$set: user} , {
            new: true
        });
    }

    /**
     *
     * @param id
     * @returns {*}
     */
    delete(id)
    {
        return Users.findByIdAndRemove(id);
    }

    get(id)
    {
        if (id) {
            return Users.findById(id)
        }
        else{
            return Users.find()
        }

    }

    /**
     *
     * @param id
     * @returns {*}
     */
    getCurrentSession(id)
    {
        return Users.findById(id);
    }

    /**
     *
     * @param user
     * @returns {*}
     */
    activateAccount(user)
    {
        return Users
            .findOneAndUpdate(
                {
                    token_confirmation: user.token_confirmation,
                    activated: 0
                },
                {
                    activated: 1
                },
                {
                    new: true,                       // return updated doc
                    //runValidators: true              // validate before update
                });
    }

    /**
     *
     * @param user
     * @returns {*}
     */
    setTokenReset(user)
    {
        return Users
            .findOneAndUpdate(
                {
                    email: user.email,
                },
                {
                    token_reset: crypto.randomBytes(16).toString('hex')
                },
                {
                    new: true, // return updated doc
                });
    }

    /**
     *
     * @param token
     * @returns {*}
     */
    checkToken(token)
    {
        return Users.findOne({
            token_reset: token,
        });
    }

    /**
     *
     * @param token
     * @param password
     * @returns {*}
     */
    resetPassword(password, token)
    {
        const model = new Users();
        return model.changePassword(token, password);
    }

}

module.exports = new UserRepository ();
