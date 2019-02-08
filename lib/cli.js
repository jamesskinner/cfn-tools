import program from 'commander';
import yaml from 'js-yaml';

import * as config from './config';
import log from './logger';


program.option('-c, --config-file <configFile>', 'Config file path', config.DEFAULT_CONFIG_FILE);
program.option('-v, --verbose', 'Enable debug logging');

program
  .command('init')
  .description('Create empty config file')
  .action(init);
program
  .command('s3-sync')
  .description('Sync templates to S3')
  .action(() => runCommand('s3-sync'));
program
  .command('cfn-deploy')
  .description('Create/update stack from S3 bucket')
  .action(() => runCommand('cfn-deploy'));
program
  .command('deploy')
  .description('Sync templates to S3 and create/update stack')
  .action(() => runCommand('deploy'));
program
  .command('get-output')
  .description('Get output from existing stack')
  .action(() => runCommand('get-output'));

program.parse(process.argv);

function init() {
  config.writeDefaultConfig();
  log.info(`Wrote file to ${config.DEFAULT_CONFIG_FILE}`);
}

async function runCommand(name, ...args) {
  if (program.verbose) log.setLevel('DEBUG');
  try {
    const conf = config.loadConfig({ file: program.configFile });
    log.debug('Config:\n ', yaml.dump(conf).replace(/\n/g, '\n  '));
    const mod = await import(`../lib/commands/${name}`)
    const result = await mod.default(conf, ...args);
    if (result) console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}
