const mongoose = require('mongoose');
const logger = require('../logger/logger');

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
}).then(function() {
    logger.info('Mongo connection established');
}).catch(function() {
    throw new Error('Unable to connect to database');
});

mongoose.set('debug', function(collectionName, method, query, doc) {
    logger.info(`${collectionName}.${method}`, query, doc);
});
