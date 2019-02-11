import aws from 'aws-sdk';

import log from '../logger';

const cloudformation = new aws.CloudFormation();


export default async (conf) => {
  const stackName = conf.STACK_NAME;
  const parameters = conf.parameters;
  const templateURL = [
    'https://s3.amazonaws.com',
    conf.TEMPLATE_S3_BUCKET,
    ...(conf.TEMPLATE_S3_BASE_PATH ? [conf.TEMPLATE_S3_BASE_PATH] : []),
    stackName,
    conf.MASTER_TEMPLATE_NAME,
  ].join('/');

  const existing = await getStack(stackName);
  const params = {
    StackName: stackName,
    TemplateURL: templateURL,
    Capabilities: ['CAPABILITY_NAMED_IAM'],
    Parameters: cfParameterMap(parameters),
  };

  let waitForEvent;
  if (!existing) {
    log.info('Creating new stack', stackName, templateURL);
    await cloudformation.createStack(params).promise();
    waitForEvent = 'stackCreateComplete';
  } else {
    log.info('Updating stack', stackName, templateURL);
    await cloudformation.updateStack(params).promise();
    waitForEvent = 'stackUpdateComplete';
  }
  await logStackEvents(stackName, waitForEvent);
};

async function getStack(stackName) {
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

function cfParameterMap(parameters = {}) {
  return Object.entries(parameters).map(([k, v]) => ({
    ParameterKey: k,
    ParameterValue: v,
  }));
}

async function logStackEvents(stackName, waitForEvent) {
  const startTime = Date.now() - 20000;
  let keepLogging = true;
  let lastEventId;
  cloudformation.waitFor(waitForEvent).promise().then(() => {
    keepLogging = false;
  }).catch((e) => {
    log.error(e);
    keepLogging = false;
  });
  while (keepLogging) {
    const response = await cloudformation.describeStackEvents({
      StackName: stackName,
    }).promise();
    const allEvents = response.StackEvents
      .filter(e => e.Timestamp > startTime);
    const oldestIndex = allEvents.findIndex(e => e.EventId === lastEventId);
    const events = oldestIndex === -1 ? allEvents : allEvents.slice(0, oldestIndex);
    displayEvents(events);
    if (events[0]) lastEventId = events[0].EventId;
    await delay(5000);
  }
}

function displayEvents(events) {
  events
    .concat()
    // oldest first
    .sort((a, b) => (a.Timestamp < b.Timestamp ? -1 : 1))
    .forEach((event) => {
      console.log([
        `[${event.Timestamp.toISOString()}]`,
        event.StackName, '-',
        event.LogicalResourceId,
        event.ResourceStatus,
        event.ResourceStatusReason,
      ].join(' '));
    });
}

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}
