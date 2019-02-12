import getStack from '../get-stack';
import log from '../logger';


export default async (conf, opts = {}) => {
  log.trace('opts', JSON.stringify(opts));
  const stack = await getStack(conf);
  if (!stack) {
    log.error(`Stack not found: ${conf.STACK_NAME}`);
    return null;
  }
  const output = stack.Outputs.reduce((acc, member) => {
    acc[member.OutputKey] = member.OutputValue;
    return acc;
  }, {});
  if (opts.outputKey) {
    if (!output[opts.outputKey]) {
      log.error(`Output key not found: ${opts.outputKey}`);
      return null;
    }
    return output[opts.outputKey];
  }
  return output;
};
