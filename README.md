CLI tool for deploying CloudFormation templates

Expects you to have a config file `cfn-tools-config.yaml` and a templates directory in the CWD.
Then run

```
cfn-tools deploy
```
To sync templates to an S3 bucket and create/update CF stack
