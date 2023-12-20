const fs = require('fs');
import { linesFromGitDiff, specFilesChanged } from './git-diff';
import { descriptionFromSpecFile } from './jest-info';

export async function print_diff(gDiff = null, ignore = []): Promise<void> {
    if (gDiff === null) {
        throw "error no git diff provided"
    }
    const files = specFilesChanged(gDiff, ignore);
    print_diff_from_files(files);
}

export function print_diff_from_files(files: Array<string>, gDiff: string | undefined = undefined) {
    if (files === undefined || !files.length) { return console.error('No test files changes'); }
    let changesPrinted = false;
    files.forEach((filename) => {
        const linesChanged = (gDiff) ? linesFromGitDiff(gDiff, filename) : null;
        const specFile = fs.readFileSync(filename, 'utf8');
        const { tree, doc } = descriptionFromSpecFile(specFile, linesChanged);
        if (tree.length > 0) {
            console.log(doc);
            changesPrinted = true
        }
    });
    if (!changesPrinted) {
        console.log('No changes to print');
    }
}
