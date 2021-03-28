# HelloCodedeploy

This is a project for easily deploying [AWS CodeDeploy Sample load-balancing/elb-v2](https://github.com/aws-samples/aws-codedeploy-samples/tree/fe237a2c7e73152f6d00758fbe5c149a9fa34e68/load-balancing/elb-v2) with AWS CDK

# Prerequisites

- Nodejs 10.x
- AWS Account and Locally configured AWS credential

# Installation

Install project dependencies

```bash
$ npm i -g cdk@1.75.0
$ npm i
```

# How To Use

## CDK Deploy

```bash
$ git clone https://github.com/HoYoung1/HelloCodedeploy.git

# You must modify your accountId and region in the lib/config.ts file.
$ cdk bootstrap
$ cdk list
$ cdk deploy HelloCodedeployStack
```

## Set Submodule

```bash
$ git submodule init && git submodule update # init AWS CodeDeploy Sample 
$ cd ./aws-codedeploy-samples/applications/SampleApp_Linux
$ ls -l 
-rwxr-xr-x  1 hoyeongkim  staff  10884 Mar 22 17:08 LICENSE.txt
-rwxr-xr-x  1 hoyeongkim  staff    359 Mar 22 17:08 appspec.yml
-rwxr-xr-x  1 hoyeongkim  staff    717 Mar 22 17:08 index.html
drwxr-xr-x  5 hoyeongkim  staff    160 Mar 22 17:08 scripts
```

## Run CodeDeploy

```bash
$ pwd
~/hello-codedeploy/aws-codedeploy-samples/applications/SampleApp_Linux
$ git init 
$ git commit -am "First Commit"
$ git remote add suborigin [Repo Url] # Copy repository URL in AWS CodeCommit
$ git push suborigin master # codecommit helper is needed
```

As soon as you push, you can see the pipeline running in the console.