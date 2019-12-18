const mongoose = require('mongoose');

const Right = mongoose.model('Right', {
    role: {
        type: String
    },
    content_id: {
        type: String
    },
    read: {
        type: Boolean
    },
    write: {
        type: Boolean
    }
});

module.exports = Right;
