# Jest-Test-Diff

Shows test documentation for changes made between a checked out branch and master.

## Installation

`npm i -g jest-test-diff`

## Usage

### Print test file spec description

Provide a list of test files it will print the test descriptions composed for human readability.

For example: `jest-test-diff test/mySpecFile.test.js`

### Print test file spec changes using git diff

Pipe a git diff in via stdin it will print the diff related to only the lines that were changed.

For example: `git diff origin/main | jest-test-diff`

If you want to ignore some files in the git diff, use the `--ignore` flag. Provide substrings, and if a filename in the git diff matches any of those substrings it will be skipped.
(This flag is ignored when passing filenames.)

For example: `git diff origin/main | jest-test-diff --ignore snap`

Available flags:
`--help`            prints the help text
`--ignore  -i`      Ignore files in a git diff if their filenames contain any of the provided strings (multiple strings are accepted)
