import path from 'path';
import aws from 'aws-sdk';
import rread from 'fs-readdir-recursive';
import fs from 'fs';
import util from 'util';
import log from '../logger';


const readFile = util.promisify(fs.readFile);
const s3 = new aws.S3();

export default async (conf) => {
  const dir = conf.TEMPLATE_DIR;
  const bucket = conf.TEMPLATE_S3_BUCKET;
  const s3Path = conf.TEMPLATE_S3_BASE_PATH || conf.STACK_NAME;
  log.info(`Syncing ${dir} dir to ${bucket}/${s3Path}`);
  const paths = rread(dir);
  await Promise.all(paths.map(async (filePath) => {
    await s3.putObject({
      Body: await readFile(path.join(dir, filePath)),
      Key: `${s3Path}/${filePath}`,
      Bucket: bucket,
    }).promise();
  }));
  log.info(`Synced ${paths.length} files`);
};
