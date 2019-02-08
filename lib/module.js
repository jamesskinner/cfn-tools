import * as config from './config';
import getOutputCmd from './commands/get-output';

export async function getOutput(opts = {}) {
  const conf = opts.conf || config.loadConfig({ file: opts.file });
  return getOutputCmd(conf);
}
