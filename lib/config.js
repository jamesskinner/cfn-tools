import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import _ from 'lodash';

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
  const config = _.merge(
    {},
    DEFAULT_CONFIG,
    loadConfigFile(file),
    getEnvConfig(),
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
  return yaml.safeLoad(fs.readFileSync(path.resolve(file)));
}

export function wrtieDefaultConfig() {
  fs.writeFileSync(DEFAULT_CONFIG_FILE, yaml.dump(DEFAULT_CONFIG));
}

function getEnvConfig() {
  const ecf = _.chain(process.env)
    .filter((v, k) => k.startsWith(CONFIG_ENV_PREFIX))
    .mapKeys((v, k) => k.replace(CONFIG_ENV_PREFIX, ''));

  if (ecf.STACK_PARAMETERS) ecf.STACK_PARAMETERS = JSON.parse(ecf.STACK_PARAMETERS);
  else ecf.STACK_PARAMETERS = {};

  const parameterConfig = _.filter(ecf, (v, k) => k.startsWith('STACK_PARAMETER_'));
  _.forEach(parameterConfig, (v, k) => {
    const paramKey = k.replace('STACK_PARAMETER_', '');
    ecf.STACK_PARAMETERS[paramKey] = v;
  });

  return ecf;
}
