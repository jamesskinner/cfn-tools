import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import _ from 'lodash';

import log from './logger';

export const DEFAULT_CONFIG_FILE = './cfn-tools-config.yaml';

export const CONFIG_ENV_PREFIX = 'CFNT_';

export const DEFAULT_CONFIG = {
  STACK_NAME: null,
  TEMPLATE_S3_BUCKET: null,
  TEMPLATE_S3_BASE_PATH: '',
  MASTER_TEMPLATE_NAME: 'master.yaml',
  STACK_PARAMETERS: {},
  TEMPLATE_DIR: './templates',
};

const REQUIRED_CONFIG = [
  'STACK_NAME',
];

export function loadConfig({ file }) {
  const fileConfig = loadConfigFile(file);
  const envConfig = getEnvConfig();
  log.trace(`File config ${JSON.stringify(fileConfig)}`);
  log.trace(`Env config ${JSON.stringify(envConfig)}`);
  const config = _.merge(
    {},
    DEFAULT_CONFIG,
    fileConfig,
    envConfig,
  );
  checkRequired(config);
  return config;
}

function checkRequired(config) {
  const missing = REQUIRED_CONFIG.filter(configKey => !config[configKey]);
  if (!missing.length) return;
  throw new Error(`Missing config: ${missing}`);
}

function loadConfigFile(file = DEFAULT_CONFIG_FILE) {
  const p = path.resolve(file);
  const exists = fs.existsSync(p);
  if (!exists) {
    log.debug(`No config file found at: ${p}`);
    return {};
  }
  return yaml.safeLoad(fs.readFileSync(p));
}

export function wrtieDefaultConfig() {
  fs.writeFileSync(DEFAULT_CONFIG_FILE, yaml.dump(DEFAULT_CONFIG));
}

function getEnvConfig() {
  const ecf = _.chain(process.env)
    .pickBy((v, k) => k.startsWith(CONFIG_ENV_PREFIX) && !!v)
    .mapKeys((v, k) => k.replace(CONFIG_ENV_PREFIX, ''))
    .value();

  if (ecf.STACK_PARAMETERS) ecf.STACK_PARAMETERS = JSON.parse(ecf.STACK_PARAMETERS);
  else ecf.STACK_PARAMETERS = {};

  const parameterConfig = _.pickBy(ecf, (v, k) => k.startsWith('STACK_PARAMETER_') && !!v);
  _.forEach(parameterConfig, (v, k) => {
    const paramKey = k.replace('STACK_PARAMETER_', '');
    ecf.STACK_PARAMETERS[paramKey] = v;
  });
  return ecf;
}
