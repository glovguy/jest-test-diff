#!/usr/bin/env node

import { print_diff } from './index';
const commandLineArgs = require('command-line-args')

const optionDefinitions = [
    { name: 'src', type: String, defaultOption: true, multiple: true },
    // { name: 'ignore', type: String, alias: 'i' },
];
const options = commandLineArgs(optionDefinitions);
// console.log("options: ", options);

if (options['src'] === undefined || options['src'].length === 0) {
    var stdin = process.openStdin();

    var diffData = "";

    stdin.on('data', function(chunk) {
        diffData += chunk;
    });

    stdin.on('end', function() {
        print_diff(diffData);
    });
}
