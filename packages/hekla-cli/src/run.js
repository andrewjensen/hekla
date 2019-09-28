const pkg = require('../package.json');

const analyze = require('./commands/analyze');

/**
 * Run the CLI, with process.argv as inputs.
 *
 * Example usage:
 *
 * run([
 *   '/path/to/node',
 *   '/path/to/hekla',
 *   'analyze',
 *   '--config',
 *   '/path/to/hekla.config.js'
 * ])
 */
module.exports = function run(argv) {
  const program = require('commander');

  program
    .version(pkg.version, '-v, --version');

  program
    .command('analyze')
    .description('Analyze a project')
    .option('-s, --single <filename>', 'Analyze a single file')
    .option('-c, --config <filename>', 'Config file location')
    .action(analyze);

  program.parse(argv);
}
