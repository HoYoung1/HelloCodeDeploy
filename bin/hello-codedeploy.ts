import * as cdk from '@aws-cdk/core';
import { HelloCodedeployStack } from '../lib/hello-codedeploy-stack';
import * as ENV from '../lib/config'

const app = new cdk.App();
new HelloCodedeployStack(app, 'HelloCodedeployStack', {
    env: {
        account: ENV.ConfigInfo.AccountId,
        region: ENV.ConfigInfo.Region
    }
});
