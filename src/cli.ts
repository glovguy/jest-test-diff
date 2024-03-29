#!/usr/bin/env node

import { print_diff, print_diff_from_files } from './index';
const commandLineArgs = require('command-line-args')

const optionDefinitions = [
    { name: 'src', type: String, defaultOption: true, multiple: true },
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'flat', alias: 'l', type: Boolean },
    { name: 'ignore', type: String, alias: 'i', multiple: true },
];
const options = commandLineArgs(optionDefinitions);

if (options['help']) {
    console.log(`jest-test-diff

Provide a list of test files it will print the test descriptions composed for human readability.
This only accepts a list of filepaths, not folder paths.

For example:
\`jest-test-diff test/mySpec.test.js\`

Pipe a git diff in via stdin it will print the diff related to only the lines that were changed.

For example:
\`git diff | jest-test-diff\`

If you want to ignore some files in the git diff, use the \`--ignore\` flag. Provide substrings, and if a filename in the git diff matches any of those substrings it will be skipped.
(This flag is ignored when passing filenames.)

For example:
\`git diff | jest-test-diff --ignore snap .js\`
(This will ignore all snapfiles and JS files.)

If you want to print as a flat series of steps, include the \`--flat\` flag.

For example:
\`git diff | jest-test-diff --flat\`

---

Available flags:
--help    -h      Prints this help text
--flat    -l      Prints test cases as flat series of steps
--ignore  -i      Ignore files in a git diff if their filenames contain any of the provided strings (multiple strings are accepted)
`);
} else if (options['src'] !== undefined) {
    print_diff_from_files(options['src'],  options['flat'])
} else if (!process.stdin.isTTY) {
    var stdin = process.openStdin();

    var diffData = "";

    stdin.on('data', function(chunk) {
        diffData += chunk;
    });

    stdin.on('end', function() {
        print_diff(diffData, options['ignore'], options['flat']);
    });
} else {
    console.log("No input provided. Run `jest-test-diff --help` for help text.");
}
