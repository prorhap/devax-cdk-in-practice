import * as cdk from '@aws-cdk/core';
import * as sns from '@aws-cdk/aws-sns';
import { SlackNotifier } from './slack-notifier';

export class CdkworkshopStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const topic = new sns.Topic(this, "cdkTopic");

    const slackNotifier = new SlackNotifier(this, 'slackNotifier', {
      slackUrl: '<slack-webhool-url>'
    });
    
    slackNotifier.addEventSource(topic);
  }
}
