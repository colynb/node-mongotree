/*
 * mongotree
 * 
 *
 * Copyright (c) 2013 Colyn Brown
 * Licensed under the MIT license.
 */

'use strict';

var	async = require('async'),
	extend = require('util')._extend;

var MongoTree = {

	tokenize: function(str) {
		return str.trim().replace(/[^A-Za-z0-9- ]/g,'').replace(/[ ]{1,}/g,'-').toLowerCase();
	},

	addTree: function(params, collection, callback) {

		var path = null, tree = [], last = '';

		if (typeof params === 'object' && params.path) {
			path = params.path;
			delete params.path;
		} else {
			path = params;
			params = null;
		}

		var nodes = path.split('/');

		for ( var i in nodes ) {
			var node = MongoTree.tokenize(nodes[i]);
			var name = nodes[i].trim();
			tree.push(extend({_id: last + node, name: name, parent: last.replace(/\/$/,'')}, params || {}));
			last = last + node + '/';
		}

		var createFolder = function (item, callback) {

			collection.findOne( { "_id": item._id }, function(err, results){
				if (err) { throw new Error(err); }

				if (results === null) {
					collection.insert(item, function(err, results){
						if (err) { throw new Error(err); }
						callback(err, results[0]);
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
	getAncestors: function(path, collection, callback) {
		var nodes = [];

		function recurse(node) {
			collection.findOne( { "_id": node.parent }, function(err, results){
				nodes.push(results);
				if (results.parent !== '') {
					recurse(results);
				} else {
					callback(null, nodes.reverse());
				}
			});
		}

		collection.findOne( { "_id": path }, function(err, results){
			recurse(results);
		});
	},
	getDecendants: function(path, collection, callback) {
		var nodes = [];

		function recurse(node) {
			collection.findOne( { "parent": node._id }, function(err, results){
				if (results) {
					nodes.push(results);
					recurse(results);
				} else {
					callback(null, nodes);
				}
			});
		}

		collection.findOne( { "_id": path }, function(err, results){
			recurse(results);
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
exports.getAncestors = MongoTree.getAncestors;
exports.getDecendants = MongoTree.getDecendants;
exports.tokenize = MongoTree.tokenize;