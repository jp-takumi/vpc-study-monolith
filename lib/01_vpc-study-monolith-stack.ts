// デプロイコマンド
// npx aws-cdk deploy
// デストロイコマンド
// npx aws-cdk destroy

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// ※今後、ここに ec2 などを密結合で追加していきます！
import * as ec2 from 'aws-cdk-lib/aws-ec2';

// 💡 先頭の「01」を消して、アルファベットの「V」から始めます！
export class VpcStudyMonolithStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ここにVPCのできる前と後のコードを直書きしていきます！
    
    //--------------------------------- 
    // 空っぽのVPCを作成
    //---------------------------------
    const vpc = new ec2.CfnVPC(this, 'MyVpc',{
      cidrBlock: '10.0.0.0/16',
      enableDnsSupport: true,
      enableDnsHostnames: true,
      tags: [{ key: 'Name', value: 'my-monolith-vpc'}],
    });

  }
}