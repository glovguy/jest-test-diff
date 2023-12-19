#!/usr/bin/env node

import { print_diff, print_diff_from_files } from './index';
const commandLineArgs = require('command-line-args')

const optionDefinitions = [
    { name: 'src', type: String, defaultOption: true, multiple: true },
    { name: 'help', alias: 'h', type: Boolean },
    // { name: 'ignore', type: String, alias: 'i' },
];
const options = commandLineArgs(optionDefinitions);
// console.log("options: ", options);

if (options['help'] !== undefined) {
    console.log(`jest-test-diff

Provide a list of test files it will print the test descriptions composed for human readability.

For example:
\`\`\`
jest-test-diff test/mySpec.test.js
\`\`\`

Pipe a git diff in via stdin it will print the diff related to only the lines that were changed.

For example:
\`\`\`
git diff | jest-test-diff
\`\`\`

Available flags:
--help      prints this help text
`);
} else if (options['src'] !== undefined) {
    print_diff_from_files(options['src'])
} else if (options['src'] === undefined || options['src'].length === 0) {
    var stdin = process.openStdin();

    var diffData = "";

    stdin.on('data', function(chunk) {
        diffData += chunk;
    });

    stdin.on('end', function() {
        print_diff(diffData);
    });
}
