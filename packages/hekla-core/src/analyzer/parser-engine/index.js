'use strict';

const async = require('async');

const fsUtils = require('../../utils/fs-utils');
const ParserResult = require('../../utils/parser-result');
const DependencyGraph = require('../../utils/dependency-graph');
const DefaultParser = require('../../parsers/DefaultParser');

const CONCURRENT_PARSING_LIMIT = 100;

module.exports = {
  parse,
  buildDependencyGraph
};

/**
 * Parse all modules to extract components from each of them.
 *
 * @return {Promise<ParserResult>}
 */
function parse(modules, parsers) {
  return parseModulesThrottled(modules, parsers)
    .then(resultArrays => {
      const mergedResults = mergeAnalysisResults(resultArrays);
      // console.log('    Results:', mergedResults);
      return mergedResults
    });
}

function parseModulesNormal(modules, parsers) {
  return Promise.all(modules.map(module => parseModule(module, parsers)));
}

function parseModulesThrottled(modules, parsers) {
  return new Promise((resolve, reject) => {
    async.mapLimit(modules, CONCURRENT_PARSING_LIMIT,
      (module, done) => {
        parseModule(module, parsers)
          .then(resultArray => done(null, resultArray))
          .catch(err => done(err));
      },
      (err, resultArrays) => {
        console.log('finished with mapLimit');
        if (err) return reject(err);
        else return resolve(resultArrays);
      }
    );
  });
}

function buildDependencyGraph(components) {
  // Create unique IDs for components
  addIdNumbers(components);

  // Build data structures for quickly finding components
  const dependencyGraph = new DependencyGraph();
  const componentsByName = new Map();
  components.forEach(component => {
    dependencyGraph.addNode(component.id, component);
    if (componentsByName.has(component.name)) {
      throw new Error(`duplicate components found: \`${component.name}\``);
    }
    componentsByName.set(component.name, component);
    if (component.altNames) {
      component.altNames.forEach(altName => {
        if (componentsByName.has(altName)) {
          throw new Error(`duplicate components found: \`${altName}\``);
        }
        componentsByName.set(altName, component);
      });
    }
  });

  const unknownDependencies = [];

  // Create links from each component's parents to the component
  components.forEach(component => {
    component.dependencies.forEach(dependencyName => {
      if (componentsByName.has(dependencyName)) {
        const dependency = componentsByName.get(dependencyName);
        dependencyGraph.addLink(component.id, dependency.id);
      } else {
        unknownDependencies.push(dependencyName);
      }
    });
  });

  return Promise.resolve(dependencyGraph);
}

// -----------------------------------------------

/**
 * Parse a single module to extract components from it.
 *
 * @return {Promise<ParserResult>}
 */
function parseModule(module, parsers) {
  // console.log(`    Parsing ${module.path} with ${parsers.length} parsers...`);
  return Promise.all(parsers.map(parser => parser.extractComponents(module)))
    .then(resultArrays => {
      // console.log('    Results for this module:', resultArrays.length);
      let combinedResults = mergeAnalysisResults(resultArrays);

      if (combinedResults.components.length === 0 && combinedResults.errors.length === 0) {
        // No components were found with user parsers, so use the default.
        return (new DefaultParser()).extractComponents(module);
      } else {
        return combinedResults;
      }
    });
}

/**
 * @return {Promise<ParserResult>}
 */
function analyzeFiles(files, rootPath) {
  return Promise.all(files.map(file => analyzeFile(file, rootPath)))
    .then(analysisResultArray => mergeAnalysisResults(analysisResultArray));
}

/**
 * @return {Promise<ParserResult>}
 */
function analyzeFile(file, rootPath) {
  // console.log('analyzeFile', file);
  const filePath = path.resolve(rootPath, file);

  return fsUtils.getFileContents(filePath)
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
  return ParserResult.mergeAll(analysisResultArray);
}

function addIdNumbers(components) {
  let id = 1;
  components.forEach(component => {
    component.id = id;
    id++;
  });
  return components;
}
