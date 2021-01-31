#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { HelloCodedeployStack } from '../lib/hello-codedeploy-stack';

const app = new cdk.App();
new HelloCodedeployStack(app, 'HelloCodedeployStack');
