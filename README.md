# mongotree

Manage tree structures in MongoDB

## Getting Started
Install the module with: `npm install mongotree`

Create a default tree
```javascript
var mongotree = require('mongotree'),
	MongoClient = require('mongodb').MongoClient,
	dsn = 'mongodb://localhost:27017/my-database';

// Create a new tree structure in a mongodb collection
MongoClient.connect(dsn, function(err, db) {
	mongotree.addTree('products/cameras/accessories', db.collection('my-collection'), function(err, tree) {
		console.log(tree);
		db.close();
	});
});

// outputs
[ { _id: 'products', name: 'products', parent: '' },
  { _id: 'products/cameras', name: 'cameras', parent: 'products' },
  { _id: 'products/cameras/accessories',
    name: 'accessories',
    parent: 'products/cameras' } ]

```

Create a tree with custom params for nodes

```javascript
var params = {
	path: 'products/cameras/accessories',
	created: new Date()
};
mongotree.addTree(params, db.collection('my-collection'), function(err, tree) {
	console.log(tree);
});

// outputs
[ { _id: 'products',
    name: 'products',
    parent: '',
    created: Fri Aug 16 2013 09:41:44 GMT-0700 (MST) },
  { _id: 'products/cameras',
    name: 'cameras',
    parent: 'products',
    created: Fri Aug 16 2013 09:41:44 GMT-0700 (MST) },
  { _id: 'products/cameras/accessories',
    name: 'accessories',
    parent: 'products/cameras',
    created: Fri Aug 16 2013 09:41:44 GMT-0700 (MST) } ]
```

Create a tree with friendly path names

```javascript
mongotree.addTree('Products / Cameras / Camera Accessories', collection, function(err, tree) {
	console.log(tree);
});

// outputs
[ { _id: 'products',
    name: 'Products',
    parent: '' },
  { _id: 'products/cameras',
    name: 'Cameras',
    parent: 'products' },
  { _id: 'products/cameras/camera-accessories',
    name: 'Camera Accessories',
    parent: 'products/cameras' } ]
```