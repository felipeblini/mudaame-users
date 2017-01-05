//Hivepod Metamodel
var meta = require('./meta');

var metamodel = new meta.Metamodel({
	classes : [
		new meta.Class({
			name: 'User',
			attributes: [
				new meta.Attribute({ name: 'Name', type: 'string', required: true }),
				new meta.Attribute({ name: 'Age', type: 'int' }),
				new meta.Attribute({ name: 'IsActive', type: 'bool', required: true }),
				new meta.Attribute({ name: 'Picture', type: 'image' }),
				new meta.Attribute({ name: 'Location', type: 'geopoint' })	
			],
			operations: [
				new meta.Operation({ name: 'query',  isQuery: true }),
				new meta.Operation({ name: 'create', isCreation: true }),
				new meta.Operation({ name: 'update', isUpdate: true }),
				new meta.Operation({ name: 'delete', isDeletion: true })
			]			
		}),
		new meta.Class({
			name: 'Profile',
			attributes: [
				new meta.Attribute({ name: 'Description', type: 'string', required: true })	
			],
			operations: [
				new meta.Operation({ name: 'query',  isQuery: true }),
				new meta.Operation({ name: 'create', isCreation: true }),
				new meta.Operation({ name: 'update', isUpdate: true }),
				new meta.Operation({ name: 'delete', isDeletion: true })
			]			
		})	
	],
	associations : [
		new meta.Association({
			name: 'UserProfile',
			composition: false,
			aClass: 'user',
			aRole: 'profile',
			aMinCardinality: 0,
			aMaxCardinality: Number.MAX_VALUE,
			bClass: 'profile',
			bRole: 'user',
			bMinCardinality: 0,
			bMaxCardinality: 1
		})	
	]
});
		
module.exports = metamodel;
