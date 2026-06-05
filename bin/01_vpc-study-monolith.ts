#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'; 
import { VpcStudyMonolithStack } from '../lib/01_vpc-study-monolith-stack'; 

const app = new cdk.App();

new VpcStudyMonolithStack(app, 'VpcStudyMonolithStack', {

});
