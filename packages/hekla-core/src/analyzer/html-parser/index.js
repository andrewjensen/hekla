'use strict';

const htmlparser = require('htmlparser2');

module.exports = {
  getDependencies
};

function getDependencies(fileContents, filePath) {
  const dependencies = [];

  var parser = new htmlparser.Parser({

    onopentag: (name, attrs) => {
      if (isSpecialTag(name)) {
        dependencies.push(name);
      }

      // TODO: check special attributes
      // for (let key in attrs) {
      // }
    }

  }, {decodeEntities: true});
  parser.write(fileContents);
  parser.end();

  return cleanDependencyList(dependencies);
}

function isSpecialTag(tagName) {
  return (tagName.indexOf('-') !== -1);
}

function getDmComponentName(attrValue, filePath) {
  let name = attrValue;

  if (attrValue.indexOf('./') === 0) {
    const pathPieces = filePath.split('/');
    const folderName = pathPieces[pathPieces.length - 2];
    name = name.replace('./', folderName + '/');
  }

  return name;
}

function cleanDependencyList(dependencies) {
  const uniqueDependencies = uniq(dependencies);
  return uniqueDependencies
    .sort();
}

// Courtesy of http://stackoverflow.com/a/9229821/2418448
function uniq(a) {
  var seen = {};
  var out = [];
  var len = a.length;
  var j = 0;
  for(var i = 0; i < len; i++) {
    var item = a[i];
    if(seen[item] !== 1) {
      seen[item] = 1;
      out[j++] = item;
    }
  }
  return out;
}
