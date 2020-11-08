'use strict';
var packager = require('electron-packager');
var options = {
    'platform': process.platform,
    'dir': '.',
    'ignore': '^/(?!node_modules|dist|package.json)',
    'name': 'Cment',
    'out': './releases',
    'overwrite': true,
    'prune': true,
    'asar': true
};
packager(options, function done_callback(err, appPaths) {
    console.log("Error: ", err);
    console.log("appPaths: ", appPaths);
});