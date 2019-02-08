import s3Sync from './s3-sync';
import cfDeploy from './cfn-deploy';

export default async (conf) => {
  await s3Sync(conf);

  await cfDeploy(conf);
};
