'use strict';

var mongotree = require('../lib/mongotree.js'),
	async =  require('async'),
	MongoClient = require('mongodb').MongoClient;

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
	test.expect(numAssertions)
	test.done()
  Test assertions:
	test.ok(value, [message])
	test.equal(actual, expected, [message])
	test.notEqual(actual, expected, [message])
	test.deepEqual(actual, expected, [message])
	test.notDeepEqual(actual, expected, [message])
	test.strictEqual(actual, expected, [message])
	test.notStrictEqual(actual, expected, [message])
	test.throws(block, [error], [message])
	test.doesNotThrow(block, [error], [message])
	test.ifError(value)
*/

function guid() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
}

var uuid = guid();
var collection_name = uuid;
var db_name = 'mongotree-test-' + uuid;
var dsn = 'mongodb://localhost:27017/' + db_name;

exports['mongotree'] = {
	setUp: function(done) {
		done();
	},
	tearDown: function(callback) {
		MongoClient.connect(dsn, function(err, db) {
			db.dropDatabase(function(err, done){
				db.close();
				callback();
			});
		});
	},
	'tree should have 2 nodes': function(test) {
		test.expect(1);

		// Add a tree with nodes containing custom params
		MongoClient.connect(dsn, function(err, db) {
			var collection = db.collection(collection_name);
			var date = new Date();
			var params = {
				path: 'some/path/child',
				created: date
			};
			mongotree.addTree(params, collection, function(err, tree) {
				db.close();
				test.equal(tree.length, 3);
				test.done();
			});
		});
	},
	'tree should have nodes with custom params': function(test) {
		test.expect(1);

		// Add a tree with nodes containing custom params
		MongoClient.connect(dsn, function(err, db) {
			var collection = db.collection(collection_name);
			var date = new Date();
			var params = {
				path: 'some/path/child',
				created: date
			};
			mongotree.addTree(params, collection, function(err, tree) {
				db.close();
				test.equal(tree[0].created, date);
				test.done();
			});
		});
	},
	'tree should have 1 node': function(test) {
		test.expect(1);
		
		// Add a tree by string only
		MongoClient.connect(dsn, function(err, db) {
			var collection = db.collection(collection_name);
			mongotree.addTree('some', collection, function(err, tree) {
				db.close();
				test.equal(tree.length, 1);
				test.done();
			});
		});
	},
	'root node should have no parent': function(test) {
		test.expect(1);
		
		// Add a tree by string only
		MongoClient.connect(dsn, function(err, db) {
			var collection = db.collection(collection_name);
			async.waterfall([
				function(callback){
					mongotree.addTree('some/path', collection, function(err, tree) {
						callback(err);
					});
				},
				function(callback){
					mongotree.getParent('some', collection, function(err, parent) {
						callback(err, parent);
					});
				}
			],
			function (err, parent) {
				test.equal(parent, null);
				db.close();
				test.done();
			});
		});
	},
	'child node should have a parent': function(test) {
		test.expect(1);
		
		// Add a tree by string only
		MongoClient.connect(dsn, function(err, db) {
			var collection = db.collection(collection_name);
			async.waterfall([
				function(callback){
					mongotree.addTree('some/path', collection, function(err, tree) {
						callback(err);
					});
				},
				function(callback){
					mongotree.getParent('some/path', collection, function(err, parent) {
						callback(err, parent);
					});
				}
			],
			function (err, parent) {
				test.equal(parent['_id'], 'some');
				db.close();
				test.done();
			});
		});
	},
	'parent node should have 2 children': function(test) {
		test.expect(1);
		
		// Add a couple trees then get children
		MongoClient.connect(dsn, function(err, db) {

			var collection = db.collection(collection_name);
			async.waterfall([
				function(callback){
					mongotree.addTree('some/path', collection, function(err, tree) {
						callback(err);
					});
				},
				function(callback){
					mongotree.addTree('some/path2', collection, function(err, tree2) {
						callback(err);
					});
				},
				function(callback){
					mongotree.getChildren('some', collection, function(err, children){
						callback(err, children);
					});
				}
			],
			function (err, children) {
				test.equal(children.length, 2);
				db.close();
				test.done();
			});
		});
	},
	'node should have 2 siblings': function(test) {
		test.expect(1);
		
		// Add a couple trees then get siblings
		MongoClient.connect(dsn, function(err, db) {

			var collection = db.collection(collection_name);
			async.waterfall([
				function(callback){
					mongotree.addTree('some/path', collection, function(err, tree) {
						callback(err);
					});
				},
				function(callback){
					mongotree.addTree('some/path2', collection, function(err, tree2) {
						callback(err);
					});
				},
				function(callback){
					mongotree.addTree('some/path3', collection, function(err, tree3) {
						callback(err);
					});
				},
				function(callback){
					mongotree.getSiblings('some/path', collection, function(err, siblings){
						callback(err, siblings);
					});
				}
			],
			function (err, siblings) {
				test.equal(siblings.length, 2);
				db.close();
				test.done();
			});
		});
	}
};
