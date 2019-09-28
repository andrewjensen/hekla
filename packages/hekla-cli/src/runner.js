var program = require('commander');
var pkg = require('../package.json');

var analyze = require('../src/commands/analyze');

program
  .version(pkg.version, '-v, --version');

program
  .command('analyze')
  .description('Analyze a project')
  .option('-s, --single <filename>', 'Analyze a single file')
  .option('-c, --config <filename>', 'Config file location')
  .action(analyze);

const argv = process.argv;
argv[0] = 'node';
argv[1] = 'hekla';

console.log('argv:', argv);

program.parse(argv);
