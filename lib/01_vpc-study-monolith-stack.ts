// デプロイコマンド
// npx aws-cdk deploy
// デストロイコマンド
// npx aws-cdk destroy

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2'; 
import * as cr from 'aws-cdk-lib/custom-resources';

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

    //--------------------------------- 
    // subnetを作る
    //---------------------------------
    const publicSubnet = new ec2.CfnSubnet(this, 'SimpleSubnet',{
      vpcId: vpc.ref,
      cidrBlock: '10.0.1.0/24',
      availabilityZone: 'ap-northeast-1a',
      mapPublicIpOnLaunch: true,
      tags: [{ key: 'Name', value: 'MyPublicSubnet'}],
    });

    //--------------------------------- 
    // routetableを作成
    //---------------------------------
    const routeTable = new ec2.CfnRouteTable(this, 'MyRouteTable',{
      vpcId: vpc.ref,
      tags: [{ key: 'Name', value: 'my-monolith-rt'}],
    });

    //--------------------------------- 
    // subnetとroutetableを紐づけ
    //---------------------------------
    new ec2.CfnSubnetRouteTableAssociation(this, "MySubnetAssociation",{
      subnetId: publicSubnet.ref,
      routeTableId: routeTable.ref,
    });
  }
}