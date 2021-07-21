declare var require: any;
const fs = require('fs');
import * as simpleGitInit from 'simple-git';
import { linesFromGitDiff, specFilesChanged } from './git-diff';
import { printAllDescribesFromSpecFile } from './jest-info';

const simpleGit = simpleGitInit();
const comparisonBranchName = 'master';
const ignoreRegex = /\+\+\+ b.(.*spec.*\.snap)/g;

export function generate_diff(): void {
    simpleGit.diff(['-U0', comparisonBranchName], (_err: () => {}, gDiff: string) => {
        const files = specFilesChanged(gDiff, ignoreRegex);
        if (files === undefined) { return console.log('No changes '); }
        files.forEach((filename) => {
            const linesChanged = linesFromGitDiff(gDiff, filename);
            const specFile = fs.readFileSync(filename, 'utf8');
            const { tree, doc } = printAllDescribesFromSpecFile(specFile, linesChanged);
            if (tree.length > 0) { console.log(doc); }
        });
    });
}
