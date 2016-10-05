
const utils = require('../../utils');

module.exports = {
  parse
};

/**
 * Parse all modules to extract components from each of them.
 *
 * @return {Promise<AnalysisResult>}
 */
function parse(modules, parsers) {
  return Promise.all(modules.map(module => parseModule(module, parsers)))
    .then(resultArrays => {
      const mergedResults = mergeAnalysisResults(resultArrays);
      // console.log('    Results:', mergedResults);
      return mergedResults
    });
}

/**
 * Parse a single module to extract components from it.
 *
 * @return {Promise<AnalysisResult>}
 */
function parseModule(module, parsers) {
  // console.log(`    Parsing ${module.path} with ${parsers.length} parsers...`);
  return Promise.all(parsers.map(parser => parser.extractComponents(module)))
    .then(resultArrays => {
      // console.log('    Results for this module:', resultArrays.length);
      return mergeAnalysisResults(resultArrays);
    });
}

/**
 * @return {Promise<AnalysisResult>}
 */
function analyzeFiles(files, rootPath) {
  return Promise.all(files.map(file => analyzeFile(file, rootPath)))
    .then(analysisResultArray => mergeAnalysisResults(analysisResultArray));
}

/**
 * @return {Promise<AnalysisResult>}
 */
function analyzeFile(file, rootPath) {
  // console.log('analyzeFile', file);
  const filePath = path.resolve(rootPath, file);

  return utils.getFileContents(filePath)
    .then(contents => {
      return parseAST(contents, filePath);
    })
    .catch(err => ({
      components: [],
      errors: [err]
    }))
    .then(ast => {
      return Promise.all([
        // Add more types of components here!
        backboneView.analyzeAllInFile(ast, filePath, rootPath),
        ngDirective.analyzeAllInFile(ast, filePath, rootPath)
      ]);
    })
    .then(analysisResultArray => mergeAnalysisResults(analysisResultArray))
    .catch(err => {
      console.log('Error while analyzing file:', filePath);
      console.log(err);
      console.log();
      return [];
    });
}

function mergeAnalysisResults(analysisResultArray) {
  return {
    components: mergeArrays(analysisResultArray.map(result => result.components)),
    errors: mergeArrays(analysisResultArray.map(result => result.errors))
  };
}

function mergeArrays(arrays) {
  return [].concat.apply([], arrays);
}
