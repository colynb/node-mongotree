# mongotree

Manage tree structures in MongoDB

## Getting Started
Install the module with: `npm install mongotree`

```javascript
var mongotree = require('mongotree'),
	MongoClient = require('mongodb').MongoClient,
	dsn = 'mongodb://localhost:27017/my-database';
	
// Create a new tree structure in a mongodb collection
MongoClient.connect(dsn, function(err, db) {
	mongotree.addTree('some/path', db.collection('my-collection'), function(err, tree) {
		console.log(tree);
	});
});
```