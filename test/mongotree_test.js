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
			db.dropCollection(collection_name, function(err, done){
				db.dropDatabase(function(err, done){
					db.close();
					callback();
				});
			});
		});
	},
	'tree should have length of 2': function(test) {
		test.expect(1);
		// tests here
		MongoClient.connect(dsn, function(err, db) {
			var collection = db.collection(uuid);
			mongotree.addTree('some/path/child', collection, function(err, tree) {
				db.dropCollection(uuid, function(err, done){
					db.close();
					test.equal(tree.length, 3);
					test.done();
				});
			});
		});
	},
	'tree should have length of 1': function(test) {
		test.expect(1);
		// tests here
		MongoClient.connect(dsn, function(err, db) {
			var collection = db.collection(uuid);
			mongotree.addTree('some', collection, function(err, tree) {
				db.dropCollection(uuid, function(err, done){
					db.close();
					test.equal(tree.length, 1);
					test.done();
				});
			});
		});
	},
	'parent should have 2 children': function(test) {
		test.expect(1);
		// tests here
		MongoClient.connect(dsn, function(err, db) {

			var collection = db.collection(uuid);
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
				db.dropCollection(uuid, function(err, done){
					test.equal(children.length, 2);
					db.close();
					test.done();
				});  
			});
		});
	},
	'node should have 2 siblings': function(test) {
		test.expect(1);
		// tests here
		MongoClient.connect(dsn, function(err, db) {

			var collection = db.collection(uuid);
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
				db.dropCollection(uuid, function(err, done){
					test.equal(siblings.length, 2);
					db.close();
					test.done();
				});  
			});
		});
	}
};
