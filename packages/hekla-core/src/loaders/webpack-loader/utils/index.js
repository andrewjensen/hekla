'use strict';

module.exports = {
  simplifyModule,
  shortName,
  formatData
};

function simplifyModule(module) {
  // const simplified = Object.assign({}, module);
  // delete simplified.source;

  const simplified = {
    id: module.id,
    name: shortName(module),
    path: module.name,
    level: module.level
  };

  return simplified;
};

function shortName(module) {
  const pieces = module.name.split('/');
  return pieces[pieces.length - 1];
}

function formatData(data) {
  return JSON.stringify(data, null, 2);
}
