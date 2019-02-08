import path from 'path';
import aws from 'aws-sdk';
import rread from 'fs-readdir-recursive';
import fs from 'fs';
import util from 'util';
import log from '../logger';


const readFile = util.promisify(fs.readFile);
const s3 = new aws.S3();

export default async (conf) => {
  const dir = conf['template-dir'];
  const bucket = conf['template-s3-bucket'];
  const s3Path = conf['template-s3-base-path'] || conf['stack-name'];
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
