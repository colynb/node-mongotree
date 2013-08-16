/*
 * mongotree
 * 
 *
 * Copyright (c) 2013 Colyn Brown
 * Licensed under the MIT license.
 */

'use strict';

var	async = require('async');

var MongoTree = {
	addTree: function(path, collection, callback) {
		var nodes = path.split('/');
		var tree = [];
		var last = '';

		for ( var i in nodes ) {
			tree.push({_id: last + nodes[i], parent: last.replace(/\/$/,'')});
			last = last + nodes[i] + '/';
		}

		var createFolder = function (item, callback) {


			collection.findOne( { "_id": item._id }, function(err, results){
				if (err) { throw err; }

				if (results === null) {
					var doc = {
						'_id' : item._id,
						'parent' : item.parent
					};
					collection.insert(doc, function(err, results){
						if (err) { throw err; }
						callback(err, results);
					});
				} else {
					callback(err, results);
				}
			});

			
		};

		async.map(tree, createFolder, function(err, results){
			callback(null, results);
		});
	},
	getChildren: function(parent, collection, callback) {
		collection.find( { "parent": parent })
			.toArray(function(err, results){
				callback(err, results);
			});
	},
	getParent: function(path, collection, callback) {
		collection.findOne( { "_id": path }, function(err, results){
			collection.findOne( { "_id": results['parent'] }, function(err, results){
				callback(err, results);
			});
		});
	},
	getSiblings: function(path, collection, callback) {
		collection.findOne( { "_id": path }, function(err, results){
			collection.find( { "parent": results['parent'], "_id" : { "$ne" : results['_id'] } })
				.toArray(function(err, results){
					callback(err, results);
				});
		});
	}
};

exports.addTree = MongoTree.addTree;
exports.getChildren = MongoTree.getChildren;
exports.getParent = MongoTree.getParent;
exports.getSiblings = MongoTree.getSiblings;