import getStack from '../get-stack';
import log from '../logger';


export default async (conf) => {
  const stack = await getStack(conf);
  if (!stack) {
    log.warn('Stack not found');
    return null;
  }
  return stack.Outputs.reduce((acc, member) => {
    acc[member.OutputKey] = member.OutputValue;
    return acc;
  }, {});
};
