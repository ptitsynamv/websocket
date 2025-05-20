const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const errorHandler = require('../soft/errorHandler');
const helpFunctions = require('../soft/helpFunctions');

module.exports.login = async function (req, res) {
    const candidate = await User.findOne({email: req.body.email});
    if (candidate) {
        const passwordResult = bcrypt.compareSync(req.body.password, candidate.password);
        if (passwordResult) {

            const token = createToken(candidate.email, candidate._id);
            res.status(200).json({
                id: candidate._id,
                token: token,
                email: candidate.email,
                isAdmin: candidate.isAdmin,
                isBan: candidate.isBan,
                isMute: candidate.isMute,
                color: candidate.color,
            })
        } else {
            res.status(401).json({
                message: 'password is not valid'
            })
        }
    } else {
        const salt = bcrypt.genSaltSync(10);
        const password = req.body.password;
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(password, salt),
            color: helpFunctions.getRandomColor()
        });
        try {
            await user.save();
            const newUser = await User.findOne({email: req.body.email});
            const token = createToken(newUser.email, newUser._id);

            res.status(200).json({
                id: newUser._id,
                token: token,
                email: newUser.email,
                isAdmin: newUser.isAdmin,
                isBan: newUser.isBan,
                isMute: newUser.isMute,
                color: newUser.color,
            })
        } catch (e) {
            errorHandler(res, e);
        }
    }
};

function createToken(email, id) {
    return jwt.sign(
        {
            email: email,
            userId: id
        },
        keys.jwt,
        {expiresIn: 60*10}
    );
}

