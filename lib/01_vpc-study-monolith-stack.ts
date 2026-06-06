// デプロイコマンド
// npx aws-cdk deploy
// デストロイコマンド
// npx aws-cdk destroy
/**
 * ============================================================================
 * AWS CDK v2
 * ============================================================================
 * * 公式APIリファレンス（メイン辞書URL）
 * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html
 * * 3大原則
 * 1. サービス名で探す
 * 左のメニューから「ec2」や「rds」などのモジュールを選択する。
 * * 2. クラス名は必ず「Cfn」から始まるものを選ぶ（L1）
 * - × ec2.Vpc （L2）
 * - 〇 ec2.CfnVPC （L1）
 * * 3. 構文の正解（波カッコ { } の中身）は「〇〇Props」を見る
 * 「CfnSubnet」のページを開いたら、その中にある「CfnSubnetProps」の
 * 項目を見る。そこに必須（Required）か任意（Optional）かが全部載っている。
 * * 【Google検索で一撃で公式を呼び出す呪文】
 * 「cdk v2 [調べたいL1リソース名]」
 * - 検索例: cdk v2 CfnDBInstance      (RDSインスタンス本体)
 * - 検索例: cdk v2 CfnDBSubnetGroup   (RDS用のサブネット束ねるやつ)
 * ============================================================================
 */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2'; 
//import * as cr from 'aws-cdk-lib/custom-resources';
//Budgets用のモジュール
import * as budgets from 'aws-cdk-lib/aws-budgets';
//.envを読み込むやつ
import * as dotenv from 'dotenv';
dotenv.config();

export class VpcStudyMonolithStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    
    //変数alertEmaiを定義
    const alertEmail = process.env.ALERT_EMAIL;
    if(!alertEmail){
      throw new Error('.envファイルにALERT_EMAILが設定されていません');
    }

    //--------------------------------- 
    // コスト管理(AWS Budgets)の作成
    //---------------------------------  
    new budgets.CfnBudget(this, 'MyMonthlyBudget',{
      budget: {
        budgetType: 'COST',   //コストベースの予算
        timeUnit: 'MONTHLY',  //月単位の計算
        budgetLimit: {
          amount: 10,
          unit: 'USD'         //上限額10$
        },
      },
      notificationsWithSubscribers: [
        {
          notification: {
            notificationType: 'ACTUAL',
            comparisonOperator: 'GREATER_THAN',
            threshold: 100,
          },
          subscribers: [
            {
              subscriptionType: 'EMAIL',
              //.envに記述したalertEmailに送る
              address: alertEmail,
            },
          ],
        },
      ],
    });

    //igwを定義
    const igw = new ec2.CfnInternetGateway(this, 'MyCfnInternetGateway',{
      tags: [{ key: 'Name',value: 'my-igw'}]
    });

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

    //igwとvpcを紐づける
    new ec2.CfnVPCGatewayAttachment(this, 'IgwAttachment',{
      vpcId: vpc.ref,
      internetGatewayId: igw.ref,
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

    //RDSサブネット1
    const privateSubnet1a = new ec2.CfnSubnet(this, 'rds-Subnet-1a',{
      vpcId: vpc.ref,
      cidrBlock: '10.0.2.0/24',
      availabilityZone: 'ap-northeast-1a',
      mapPublicIpOnLaunch: false,
      tags: [{ key: 'Name', value: 'MyPrivateRdsSubnet-1a'}],
    });

    //RDSサブネット2
    const privateSubnet1c = new ec2.CfnSubnet(this, 'rds-subnet-1c',{
      vpcId: vpc.ref,
      cidrBlock: '10.0.3.0/24',
      availabilityZone: 'ap-northeast-1c',
      mapPublicIpOnLaunch: false,
      tags: [{ key: 'Name', value: 'MyPrivateRdsSubnet-1c'}],
    });


    //--------------------------------- 
    // routetableを作成
    //---------------------------------
    const routeTable = new ec2.CfnRouteTable(this, 'MyRouteTable',{
      vpcId: vpc.ref,
      tags: [{ key: 'Name', value: 'my-monolith-rt'}],
    });

    new ec2.CfnRoute(this, 'DefaultRoute',{
      routeTableId: routeTable.ref,
      destinationCidrBlock: "0.0.0.0/0",
      gatewayId: igw.ref,
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