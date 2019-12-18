const express = require('express');
require('./db/mongoose');
const Right = require('./models/right');
const logger = require('./logger/logger');

const app = express();
const port = process.env.PORT || 3100;

app.use(express.json());

// req: [ { 'role': '<rolename>', 'content_id': '<content_id>', 'read': true, 'write': false }, {..}, .. ]
app.put('/coco', function(req, res) {
    if (Array.isArray(req.body)) {
        logger.info('Processing array: ',JSON.stringify(req.body));
        let response = [];
        req.body.forEach(function(element) {
            logger.info('  Processing element: ',JSON.stringify(element));
            if (true) {
                const right = new Right(element);
                right.save().then(function() {
                    logger.info('Element ',JSON.stringify(element),' saved.');
                    response.push(right);
                }).catch(function(error) {
                    logger.error('Element save caused error: ', error);
                    response.push('Request item: ',JSON.stringify(element), ' finished with error: ', error);
                });
            }
        });
        logger.info('sending response: ', JSON.stringify(response));
        res.send(response);
    } else {
        logger.error('Input: ', JSON.stringify(req.body), ' is NOT array!');
        res.send('Array input expected!');
    }
    // TODO: implement upsert of new/existing right - examine existing content_id X role
    // decompose array: forEach:
    // chk input prms
    // compose model record
    // save; TBD: versioning
});

// req: { 'content_id': '<value>' } or { 'roles': ['<role1>', '<role2>',..]]}
// TODO: return last version of doc
// response:
// {
// 	'roles': [ 'admin', 'provisioner', .. ],       // zopakovany list z req
// 	'allowed_content': [
// 		'id1': { 'read': true, 'write': false },
// 		'id2': { 'read': true, 'write': false },
// 		'id3': { 'read': true, 'write': true },
// 		..
// 	]
// }
app.get('/coco', function (req, res) {
    logger.log('req.body: ',JSON.stringify(req.body));
    let filter = {};
    if (req.body.roles) { // prepare filter for roles
        logger.info('Performing lookup by roles ', JSON.stringify(req.body.roles),' ..');
        filter.role = {};
        filter.role.$in = req.body.roles;
        logger.debug('Using filter: ',JSON.stringify(filter));
        // .find({ title: { $regex: '.*' + input + '.*' } }).limit(5).then((notes)
        // { field: { $in: [<value1>, <value2>, ... <valueN> ] } }
    } else if (req.body.content_id) { // prepare filter for content_id
        logger.info('Performing lookup by content_id ..');
        // decide whether makes sense
        res.send('Not implemented');
    } else {
        res.send('Insufficient input: Either roles or content_id must be specified!');
        return;
    }

    Right.find(filter).then(function (result) {
        logger.info('result: ',JSON.stringify(result));
        // TODO: process result => resp
        // fill roles
        // iterate returned documents and U'em into final structure
        res.send(JSON.stringify(result));
        // TODO: replace above by res.send(resp);
    }).catch(function (error) {
        res.status(500).send(error);
    });
});

app.listen(port, function () {
    logger.info('COCO service is running on port ', port);
});
