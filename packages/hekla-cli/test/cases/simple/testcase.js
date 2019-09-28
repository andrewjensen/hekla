const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const exec = promisify(child_process.exec);

const SHELL_FILE_LOCATION = path.resolve(__dirname, 'analyze.sh');
const ANALYSIS_FILE_LOCATION = path.resolve(__dirname, 'dist', 'analysis.json');
const REPORTED_FILE_LOCATION = path.resolve(__dirname, 'dist', 'report.txt');

async function runAnalysis() {
  await exec(SHELL_FILE_LOCATION);
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    } else {
      throw err;
    }
  }
}

async function readFileContents(filePath) {
  const buffer = await readFile(filePath);
  const contents = buffer.toString('utf-8');
  return contents;
}

describe('hekla-cli simple usage', () => {
  it('should create an analysis.json file', async () => {
    await runAnalysis();
    const analysisFileExists = await fileExists(ANALYSIS_FILE_LOCATION);

    expect(analysisFileExists).toBe(true);
  });

  it('should apply plugins to modules', async () => {
    await runAnalysis();
    const analysisFileExists = await fileExists(ANALYSIS_FILE_LOCATION);

    expect(analysisFileExists).toBe(true);

    const contentsJson = await readFileContents(ANALYSIS_FILE_LOCATION);
    const contents = JSON.parse(contentsJson);
    expect(contents).toHaveProperty('modules');
    expect(contents.modules).toHaveLength(4);

    for (let module of contents.modules) {
      expect(module.visited).toBe(true);
    }
  });

  it('should run reporter plugins', async () => {
    await runAnalysis();

    const reportedFileExists = await fileExists(REPORTED_FILE_LOCATION);
    expect(reportedFileExists).toBe(true);

    const contents = await readFileContents(REPORTED_FILE_LOCATION);
    expect(contents).toEqual('I found 4 modules!');
  });
});
