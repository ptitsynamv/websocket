const mongoose = require('mongoose');
const Schema = mongoose.Schema;

messageSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    date: {
        type: Date,
        default: Date.now
    },
    comment: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('messages', messageSchema);