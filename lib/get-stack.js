import aws from 'aws-sdk';

const cloudformation = new aws.CloudFormation();

export default async function getStack(conf) {
  const stackName = conf['stack-name'];
  try {
    const response = await cloudformation.describeStacks({
      StackName: stackName,
    }).promise();
    return response.Stacks[0];
  } catch (e) {
    if (e.name === 'ResourceNotFound') return null;
    if (e.code === 'ValidationError' && e.message.match(/does not exist$/)) return null;
    throw e;
  }
}
