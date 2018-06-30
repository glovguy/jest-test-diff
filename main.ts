declare var require: any
const simpleGit = require('simple-git')();
const fs = require("fs");
import { linesFromGitDiff } from './src/git-diff';
import { printAllDescribesFromSpecFile } from './src/jest-info';



const specFile = fs.readFileSync('faculty-landing-item-view.component.spec.ts', 'utf8');


let myl = [];
simpleGit.diff(['-U0'], (err, gDiff) => {
    myl = linesFromGitDiff(err, gDiff);
}).exec(() => console.log(myl) );

console.log(printAllDescribesFromSpecFile(specFile)['doc']);