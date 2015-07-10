#
# Wraps & exports a mongojs instance. Automatically selects collections based
# on the folder names under /apps. https://github.com/mafintosh/mongojs
#

mongojs = require 'mongojs'
fs = require 'fs'
path = require 'path'
{ MONGOHQ_URL } = process.env

collections = ['articles', 'users', 'verticals', 'organizations']
module.exports = mongojs MONGOHQ_URL, collections
module.exports.collections = collections
