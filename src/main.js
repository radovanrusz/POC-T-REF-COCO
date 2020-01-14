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
        let promises = [];
        req.body.forEach(function(element) {
            promises.push(put_single(element).then(function(inst) {
                return (inst);
            }))

            // // TODO: check input attributes
            // if (true) {
            //     logger.info('  Processing element: ',JSON.stringify(element));
                
            //     Right.findOne({$and: [{ role : element.role }, { content_id: element.content_id }]}, function(err, res) {
            //         if(err) {
            //             logger.error('findById caused error: ',JSON.stringify(err));
            //         } else {
            //             logger.info('findById found doc: ',JSON.stringify(res));
            //             if(!res) {
            //                 res = new Right(element);
            //             } else {
            //                 res.read = element.read;
            //                 res.write = element.write;
            //             }
            //             res.save().then(function(res2) {
            //                 logger.info('Element ',JSON.stringify(element),' saved as doc ',JSON.stringify(res2));
            //                 response.push(res2);
            //             }).catch(function(error) {
            //                 logger.error('Element save caused error: ', error);
            //                 response.push('Request item: ',JSON.stringify(element), ' finished with error: ', error);
            //             });
            //         }
            //     });
            // }


        });
        Promise.all(promises).then(function(resp){
            logger.info('sending response: ', JSON.stringify(resp));
            res.send(resp);
        });
    } else {
        logger.error('Input: ', JSON.stringify(req.body), ' is NOT array!');
        res.send('Array input expected!');
    }
});

put_single = function (element) {
    return new Promise(function(resolve, reject) {
        // TODO: check input attributes
        if (true) {
            logger.info('  Processing element: ',JSON.stringify(element));
            
            Right.findOne({$and: [{ role : element.role }, { content_id: element.content_id }]}, function(err, res) {
                if(err) {
                    logger.error('findById caused error: ',JSON.stringify(err));
                } else {
                    logger.info('findById found doc: ',JSON.stringify(res));
                    if(!res) {
                        res = new Right(element);
                    } else {
                        res.read = element.read;
                        res.write = element.write;
                    }
                    res.save().then(function(res2) {
                        logger.info('Element ',JSON.stringify(element),' saved as doc ',JSON.stringify(res2));
                        resolve(res2);
                    }).catch(function(error) {
                        logger.error('Element save caused error: ', error);
                        reject('Request item: ',JSON.stringify(element), ' finished with error: ', error);
                    });
                }
            });
        }
    });
}

// req: { 'content_id': '<value>' } or { 'roles': ['<role1>', '<role2>',..]]}
// TODO: return last version of doc
// response:
// [
// 	  {
//      "content_id": "123456",
//      "read": true,
//      "write": false
//    },
//    {
//      "content_id": "123457",
//      "read": true,
//      "write": false
//    }, ..
//   ]
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
        let resp = [];
        result.forEach(function(rec){
            let resp_element = {};
            
            resp_element.content_id = rec.content_id;
            resp_element.read = rec.read;
            resp_element.write = rec.write;
            resp.push(resp_element);
        });
        // TODO: process result => resp
        // fill roles
        // iterate returned documents and U'em into final structure
        res.send(resp);
    }).catch(function (error) {
        res.status(500).send(error);
    });
});

app.listen(port, function () {
    logger.info('COCO service is running on port ', port);
});
