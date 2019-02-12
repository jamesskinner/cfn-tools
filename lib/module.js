import * as config from './config';
import getOutputCmd from './commands/get-output';
import log from './logger';

export function trace() {
  log.setLevel('TRACE');
}

export async function getOutput(opts = {}) {
  const conf = getConfig(opts);
  return getOutputCmd(conf);
}

export function getConfig(opts = {}) {
  return config.loadConfig({ file: opts.file });
}
