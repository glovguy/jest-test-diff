
export const specFilesChanged = function(err, diffText) {
    let fileNames = [];
    diffText.split('\n').forEach((line) => {
        const match = new RegExp(/\+\+\+ b.(.*spec.*)/g).exec(line);
        if (match) {
            fileNames.push(match[1]); }
    });
    return fileNames
}

export const linesFromGitDiff = function(err, diffText, fileName) {
    const truncatedDiffText = diffText.slice('diff --git a\/'.length);
    const fileDiffs = truncatedDiffText.split(/\ndiff --git a\//);
    const diffBlock = fileDiffs.find((d) => {
        const lineStartsWithFilename = d.slice(0, fileName.length+1) == fileName + ' ';
        return lineStartsWithFilename;
    });
    let lineNums = [];
    diffBlock.split('\n').forEach((line) => {
        const match = new RegExp(/^@@ -\d+,?\d* \+(\d+),?(\d+)? @@.*/g).exec(line);
        if (match) {
            const endOfLine = match[2] ? Number(match[1])+Number(match[2])-1 : Number(match[1]);
            lineNums.push([Number(match[1]), endOfLine]); }
    });
    return lineNums;
}
