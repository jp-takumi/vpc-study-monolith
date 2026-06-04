#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'; // 💡 v2仕様（/core を消しました）
import { VpcStudyMonolithStack } from '../lib/01_vpc-study-monolith-stack'; // 💡 先頭の 01 を消しました

const app = new cdk.App();

// 💡 ここも先頭の 01 を消して、辻褄を合わせました！
new VpcStudyMonolithStack(app, 'VpcStudyMonolithStack', {
  /* AWSのアカウントやリージョンを明示的に指定したい場合は、ここに設定を書きます。
   * 今はローカルの環境（CLI設定）をそのまま使うので、このままでOKです */
});