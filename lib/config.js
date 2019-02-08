import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';

export const DEFAULT_CONFIG_FILE = './cfn-tools-config.yaml';

export const DEFAULT_CONFIG = {
  'stack-name': null,
  'template-s3-bucket': null,
  'template-s3-base-path': '',
  'master-template-name': 'master.yaml',
  'stack-parameters': {},
  'template-dir': './templates',
};

export function loadConfig({ file }) {
  return {
    ...DEFAULT_CONFIG,
    ...loadConfigFile(file),
  };
}

function loadConfigFile(file = DEFAULT_CONFIG_FILE) {
  return yaml.safeLoad(fs.readFileSync(path.resolve(file)));
}

export function wrtieDefaultConfig() {
  fs.writeFileSync(DEFAULT_CONFIG_FILE, yaml.dump(DEFAULT_CONFIG));
}
