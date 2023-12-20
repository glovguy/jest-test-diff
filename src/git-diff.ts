export type lineNumPair = Array<number>;
export type lineNumPairsArray = Array<lineNumPair>;

export const specFilesChanged = function(diffText?: string, ingoreSymbols: string[] = []): Array<string> | undefined {
    let fileNames = [];
    if (diffText === undefined) return;
    diffText.split('\n').forEach((line) => {
        const match = new RegExp(/\+\+\+ b.(.*\.[t|j]s)/g).exec(line);
        if (!match) { return; }
        if (ingoreSymbols.some(ign => line.includes(ign))) { return; }
        fileNames.push(match[1]);
    });
    return fileNames;
}

export const linesFromGitDiff = function(diffText: string, fileName: string): lineNumPairsArray {
    const truncatedDiffText = diffText.slice('diff --git a\/'.length);
    const fileDiffs = truncatedDiffText.split(/\ndiff --git a\//);
    const diffBlock = fileDiffs.filter((d) => {
        const lineStartsWithFilename = d.slice(0, fileName.length+1) == fileName + ' ';
        return lineStartsWithFilename;
    })[0];
    let lineNums = [];
    diffBlock.split('\n').forEach((line) => {
        const match = new RegExp(/^@@ -\d+,?\d* \+(\d+),?(\d+)? @@.*/g).exec(line);
        if (match) {
            const endOfLine = match[2] ? Number(match[1])+Number(match[2])-1 : Number(match[1]);
            lineNums.push([Number(match[1]), endOfLine]);
        }
    });
    return lineNums;
}
