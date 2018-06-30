declare var require: any
const simpleGit = require('simple-git')();
const fs = require("fs");
import { linesFromGitDiff, specFilesChanged } from './src/git-diff';
import { printAllDescribesFromSpecFile } from './src/jest-info';


let myl = [];
let files = [];
simpleGit.diff(['-U0'], (err, gDiff) => {
    files = specFilesChanged(err, gDiff);
    files.forEach((filename) => {
        const linesChanged = linesFromGitDiff(err, gDiff, filename);
        const specFile = fs.readFileSync(filename, 'utf8');
        const jestAssertions = printAllDescribesFromSpecFile(specFile)['tree'];
        let assertionsChanged = [];
        linesChanged.forEach((lines) => {
            assertionsChanged.push(...jestAssertions.filter((assertion) => {
                const assertionStartInPair = assertion['lineStart'] >= lines[0] && assertion['lineStart'] <= lines[1];
                const assertionEndInPair = assertion['lineEnd'] >= lines[0] && assertion['lineEnd'] <= lines[1];
                return assertionStartInPair || assertionEndInPair;
            }));
        });
        console.log('\n\n HERE ', linesChanged, '\n\n', jestAssertions, '\n\n', assertionsChanged);
    });
});
