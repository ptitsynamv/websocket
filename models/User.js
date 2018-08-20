const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required:true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isBan: {
        type: Boolean,
        default: false
    },
    isMute: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
        required: true,
        unique: true
    },
});

module.exports = mongoose.model('users', userSchema);