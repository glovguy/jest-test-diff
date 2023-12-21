const fs = require('fs');
import { linesFromGitDiff, specFilesChanged } from './git-diff';
import { descriptionFromSpecFile } from './jest-info';

export async function print_diff(gDiff = null, ignore = [], flat: boolean = false): Promise<void> {
    if (gDiff === null) {
        throw "error no git diff provided"
    }
    const files = specFilesChanged(gDiff, ignore);
    print_diff_from_files(files, flat);
}

export function print_diff_from_files(files: Array<string>, flat: boolean, gDiff: string | undefined = undefined) {
    if (files === undefined || !files.length) { return console.error('No test files changes'); }
    let changesPrinted = false;
    files.forEach((filename) => {
        const linesChanged = (gDiff) ? linesFromGitDiff(gDiff, filename) : null;
        const specFile = fs.readFileSync(filename, 'utf8');
        const { tree, doc, flatDoc } = descriptionFromSpecFile(specFile, linesChanged);
        if (tree.length > 0) {
            flat ? console.log(flatDoc) : console.log(doc)
            changesPrinted = true
        }
    });
    if (!changesPrinted) {
        console.log('No changes to print');
    }
}
