import { expect as expectCDK, matchTemplate, MatchStyle, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { SlackNotifier } from '../lib/slack-notifier';

test('Lambda - timeout should be 120 secs', () => {
  const stack = new cdk.Stack();
  new SlackNotifier(stack, 'TestStack', { slackUrl: ''});

  expectCDK(stack).to(haveResource('AWS::Lambda::Function', {
    Timeout: 120
  }))
});

test('Lambda - memory size should be btw 128 and 1024', () => {
  expect(() => {
    new SlackNotifier(new cdk.Stack(), 'TestStack', {
      slackUrl: '',
      lambdaMemorySize: 256
    })
  }).toThrowError()
});
