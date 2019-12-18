# POC-T-REF-COCO
Content control service

accepted methods:

/get    - returns list of rights for provided role list
{ 'roles': ['<role1>', '<role2>',..]]} 

returns
{
	'roles': [ 'admin', 'provisioner', .. ],       // zopakovany list z req
	'allowed_content': [
		'id1': { 'read': true, 'write': false },
		'id2': { 'read': true, 'write': false },
		'id3': { 'read': true, 'write': true },
		..
	]
}



/put    - insert list(array) of rights into mongo
[ { 'role': '<rolename>', 'content_id': '<content_id>', 'read': true, 'write': false }, {..}, .. ]

returns
TODO:

