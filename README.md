# RAML2Serverless

This tool is built to support the Development and Deployment phases of RESTful APIs to be deployed as server-less implementations on the AWS Platform. This tool takes the RESTful API design/specification in [RAML](https://raml.org/) format and generates the following:

Source Code Templates -  (currently for node.js). These are empty function definitions as expected by AWS Lambda. These map to the resource-methods on AWS API Gateway 

CloudFormation Template - This has the definition for the Lambda Functions and the mapping to corresponding resource-definition on AWS API Gateway. The template is simple and readable and uses the AWS Serverless Application Model (SAM).

We can then provide the implementation for the generated code and then execute some commands to deploy ( or redeploy) the code to AWS.

This requires us to initialize the AWS CLI.


## Installation & Usage

Install: `npm install -g raml2serverless`

Navigate to any directory of your choice :
```
cd some-custom-location
```

Run the following command to process the RAML file : 
```
raml2serverless <name-or-relative-path-to-RAMLfile>

e.g. 

raml2serverless ./Pets.RAML

```
CloudFormation Template and Source Code Templates will be created in the "output" directory 

## Deployment (updates) to AWS

Initialize the AWS CLI

Create a S3 bucket with full-permissions for the user (This is for uploading source-code. You can use an existing bucket)

Use the following command to upload the code to S3 and get an updated CloudFormation template.

```
aws cloudformation package --template <cloudformation-template> --s3-bucket <S3 bucket> --output json <updated-cloudformation-template>

```

Use the following command to create or update the resources on AWS (This will create Roles, Policies, Lambda Functions, API Gateway Definitions and deployments)

```
aws cloudformation deploy --template <updated-cloudformation-template> --stack-name <stack-name> --capabilities CAPABILITY_IAM  

```

Test the API by calling the AWS API Gateway Endpoint.

## License

MIT