const express = require('express');
require('./db/mongoose');
const Right = require('./models/right');
const logger = require('./logger/logger');

const app = express();
const port = process.env.PORT || 3100;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
        'Access-Control-Allow-Methods', 
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    )
    res.setHeader(
        'Access-Control-Allow-Headers', 
        'Cache-Control, Pragma, Origin, ' +
        'Authorization, Content-Type, X-Requested-With'
    )
    res.setHeader('Access-Control-Allow-Credentials', true)
    next()
});
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

// req: { 'roles': ['<role1>', '<role2>',..]]} or (not implemented) { 'content_id': '<value>' } 
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
    const prms = req && req.query;
    const { roles='' } = prms;
    logger.log('roles: ',roles);
    let filter = {};
    if (roles) { // prepare filter for roles
        let roleArray = roles.split(",");
        logger.info('Performing lookup by roles ', roleArray,' ..');

        filter.role = {};
        filter.role.$in = roleArray;
        logger.debug('Using filter: ',JSON.stringify(filter));
        // .find({ title: { $regex: '.*' + input + '.*' } }).limit(5).then((notes)
        // { field: { $in: [<value1>, <value2>, ... <valueN> ] } }
    } else {
        res.send('Insufficient input: Roles must be specified!');
        return;
    }

    Right.find(filter).then(function (result) {
        logger.info('result: ',JSON.stringify(result));
        let resp = [];
        result.forEach(function(rec){
            logger.info("Processing record: " + JSON.stringify(rec));
            // check whether current content_id is not already in resp
            let found = false;
            resp.some(function(element,index,array) {
                logger.info("Matching element " + JSON.stringify(element));
                logger.info("Comparing element content_id:" + element.content_id + " with response rec content_id:" + rec.content_id);
                if (element.content_id == rec.content_id) {
                    logger.info("Found match at ix: " + index);
                    array[index].read = array[index].read || rec.read;
                    array[index].write = array[index].write || rec.write;
                    found = true;
                    return found;
                }
            });
            if (!found) {
                logger.info("Inserting a new element to response")
                let resp_element = {};
                resp_element.content_id = rec.content_id;
                resp_element.read = rec.read;
                resp_element.write = rec.write;
                resp.push(resp_element);
            }
        });
        logger.info("Sending response..");
        res.send(resp);
    }).catch(function (error) {
        res.status(500).send(error);
    });
});

app.listen(port, function () {
    logger.info('COCO service is running on port ', port);
});
