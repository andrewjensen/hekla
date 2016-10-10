'use strict';

class ParserResult {
  /**
   * @private
   */
  constructor(components, parserErrorList) {
    if (!components || components.length === undefined) {
      throw new Error('components not specified');
    }

    if (!parserErrorList || parserErrorList.length === undefined) {
      throw new Error('parserErrorList not specified');
    }

    this.components = components;
    this.errors = parserErrorList;
  }

  static create(components, errors, module) {
    let parserErrorList;

    if (!errors) {
      parserErrorList = [];
    } else {
      // We have errors
      if (!errors.length) {
        // Single error = make into an array
        const error = errors;
        parserErrorList = [(new ParserError(error, module))];
      } else {
        // Array of errors
        parserErrorList = errors.map(e => (new ParserError(e, module)));
      }
    }

    return new ParserResult(components, parserErrorList);
  }

  static mergeAll(analysisResultArray) {
    analysisResultArray.forEach(result => {
      if (!(result instanceof ParserResult)) {
        throw new Error('Trying to merge an object that is not a ParserResult');
      }
    });

    const mergedComponents = mergeArrays(analysisResultArray.map(result => result.components));
    const mergedErrors = mergeArrays(analysisResultArray.map(result => result.errors));
    return new ParserResult(mergedComponents, mergedErrors);
  }
};

function mergeArrays(arrays) {
  return [].concat.apply([], arrays);
}

class ParserError {
  constructor(error, module) {
    if (error === undefined || module === undefined) {
      throw new Error('Invalid arguments for ParserError constructor');
    }

    this.reason = error;
    this.message = error.message;
    this.stack = error.stack;
    this.modulePath = module.path;
  }

  toString() {
    return `Parsing error in module '${this.modulePath}':\n${this.message}`;
  }
}

ParserResult._ParserError = ParserError; // Export for testing purposes - don't use in prod code!

module.exports = ParserResult;
