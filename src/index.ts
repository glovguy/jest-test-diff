const fs = require('fs');
import * as simpleGitInit from 'simple-git';
import { linesFromGitDiff, specFilesChanged } from './git-diff';
import { descriptionFromSpecFile } from './jest-info';

let comparisonBranchName = 'origin/main';
const ignoreRegex = /\+\+\+ b.(.*[spec|test].*\.snap)/g;

export async function print_diff(gDiff = null): Promise<void> {
    if (gDiff === null) {
        gDiff = await git_diff_text(comparisonBranchName);
    }
    const files = specFilesChanged(gDiff, ignoreRegex);
    print_diff_from_files(files);
}

async function git_diff_text(comparisonBranchName: string): Promise<string> {
    const simpleGit = simpleGitInit();
    return new Promise((resolve, reject) => {
        simpleGit.diff(['-U0', comparisonBranchName], (err: () => {}, diffText: string) => {
            if (err) { reject(err); }
            resolve(diffText);
        });
    });
}

function print_diff_from_files(files: Array<string>, gDiff: string | undefined = undefined) {
    if (files === undefined || !files.length) { return console.log('No test files changes '); }
    files.forEach((filename) => {
        const linesChanged = (gDiff) ? linesFromGitDiff(gDiff, filename) : null;
        const specFile = fs.readFileSync(filename, 'utf8');
        const { tree, doc } = descriptionFromSpecFile(specFile, linesChanged);
        (tree.length > 0) ? console.log(doc) : console.log('No changes to print');
    });
}
