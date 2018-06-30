declare var require: any
const simpleGit = require('simple-git')();
const fs = require("fs");
import { linesFromGitDiff, specFilesChanged } from './src/git-diff';
import { printAllDescribesFromSpecFile } from './src/jest-info';



// const specFile = fs.readFileSync('faculty-landing-item-view.component.spec.ts', 'utf8');


let myl = [];
let files = [];
simpleGit.diff(['-U0'], (err, gDiff) => {
    files = specFilesChanged(err, gDiff);
    files.forEach((f) => {
        myl.push(...linesFromGitDiff(err, gDiff, f));
    });
}).exec(() => console.log(myl, files) );

// console.log(printAllDescribesFromSpecFile(specFile)['doc']);
