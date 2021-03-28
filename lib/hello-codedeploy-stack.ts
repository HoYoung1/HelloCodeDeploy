import * as cdk from '@aws-cdk/core';
import * as codedeploy from '@aws-cdk/aws-codedeploy';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as autoscaling from '@aws-cdk/aws-autoscaling';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codecommit from '@aws-cdk/aws-codecommit';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as iam from '@aws-cdk/aws-iam';
import * as ENV from './config'


export class HelloCodedeployStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const defaultVpc = this.getDefaultVpc()

    const asg = this.createAsg(defaultVpc);

    // asg.attachToApplicationTargetGroup() // Todo : Modify
    
    this.createCICDPipeline(asg);
  }

  private createCICDPipeline(asg: autoscaling.AutoScalingGroup) {
    const deploymentGroup = this.createCodedeploy(asg);

    const repo = new codecommit.Repository(this, `${ENV.ConfigInfo.AppName}Repository`, {
      repositoryName: `${ENV.ConfigInfo.AppName}Repository`
    });

    const pipeline = new codepipeline.Pipeline(this, `${ENV.ConfigInfo.AppName}Pipeline`, {
      pipelineName: `${ENV.ConfigInfo.AppName}Pipeline`,
    });

    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: 'CodeCommit',
      repository: repo,
      output: sourceOutput,
    });

    const deployAction = new codepipeline_actions.CodeDeployServerDeployAction({
      actionName: 'CodeDeploy',
      input: sourceOutput,
      deploymentGroup,
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction],
    });

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [deployAction],
    });
  }

  private createCodedeploy(asg: autoscaling.AutoScalingGroup) {
    const application = new codedeploy.ServerApplication(this, 'CodeDeployApplication', {
      applicationName: `${ENV.ConfigInfo.AppName}CodedeployApplication`,
    });

    const deploymentGroup = new codedeploy.ServerDeploymentGroup(this, 'CodeDeployDeploymentGroup', {
      application,
      deploymentGroupName: `${ENV.ConfigInfo.AppName}DeploymentGroup`,
      autoScalingGroups: [asg],
      installAgent: true,
    });

    return deploymentGroup
  }

  private createAsg(defaultVpc: ec2.IVpc) {
    // Todo: Set LB -- https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/application-load-balancer/index.ts

    const mySecurityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc: defaultVpc
    });
    mySecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
    mySecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22)); 

    const asgName = 'HelloCodedeploy'
    const role = new iam.Role(this, `${asgName}Role`, {
      roleName: `${asgName}Role`,
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    new iam.Policy(this, `${asgName}Policy`, {
      statements: [
        new iam.PolicyStatement({
          actions: [
            "ec2-instance-connect:SendSSHPublicKey",
          ],
          effect: iam.Effect.ALLOW,
          resources: ["*"] // Todo : Specific resources required
        }),
        new iam.PolicyStatement({
          actions: [
            "ec2:DescribeInstances"
          ],
          effect: iam.Effect.ALLOW,
          resources: ['*'],
        }),

      ]
    }).attachToRole(role);

    const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc: defaultVpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage(),
      securityGroup: mySecurityGroup,
    });
    return asg;
  }

  private getDefaultVpc() {
    return ec2.Vpc.fromLookup(this, "defaultVpc", {
      isDefault: true
    });
  }
}
