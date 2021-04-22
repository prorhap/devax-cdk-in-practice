import * as cdk from '@aws-cdk/core';
import * as sns from '@aws-cdk/aws-sns';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaPython from '@aws-cdk/aws-lambda-python';
import { Duration } from '@aws-cdk/core';
import * as eventSource from '@aws-cdk/aws-lambda-event-sources';
import * as iam from '@aws-cdk/aws-iam';
import * as ddb from '@aws-cdk/aws-dynamodb';
import { table } from 'console';

export interface SlackNotifierProps {
    slackUrl: string,
    lambdaMemorySize? : number
}

export class SlackNotifier extends cdk.Construct {

    readonly notifierFunction: lambdaPython.PythonFunction;

    constructor(scope: cdk.Construct, id: string, props: SlackNotifierProps) {
        super(scope, id);

        if(props.lambdaMemorySize !== undefined && (props.lambdaMemorySize < 128 || props.lambdaMemorySize > 1024)) {
            throw new Error("Illegal Lambda Memory Size");
        }

        const lambdaRole = iam.Role.fromRoleArn(this, 'lambdaRole', 'arn:aws:iam::803936485311:role/lambda-user-role')

        this.notifierFunction = new lambdaPython.PythonFunction(this, "notifierFuntion", {
          entry: 'lambda',
          index: 'app.py',
          runtime: lambda.Runtime.PYTHON_3_8,
          timeout: Duration.minutes(2),
          memorySize: props.lambdaMemorySize ?? 256,
          role: lambdaRole
        });

        const notifierTable = new ddb.Table(this, "notifierTable", {
            partitionKey: {
                name: 'id',
                type: ddb.AttributeType.STRING
            },
            billingMode: ddb.BillingMode.PAY_PER_REQUEST
        });

        notifierTable.grantWriteData(this.notifierFunction.grantPrincipal);

        this.notifierFunction.addEnvironment('SLACK_URL', props.slackUrl);
        this.notifierFunction.addEnvironment('TABLE_NAME', notifierTable.tableName);
    }

    addEventSource(topic: sns.ITopic) {
        this.notifierFunction.addEventSource(new eventSource.SnsEventSource(topic));
    }
}