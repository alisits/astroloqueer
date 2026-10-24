🚀 Astroloqueer Backend – Deployment Guide (AWS SAM)
Overview

This backend is deployed using:

AWS SAM

Python 3.11

API Gateway HTTP API

Lambda (Flask via WSGI)

Secrets Manager for API keys

Deployment target:
eu-central-1

⚠️ Important: Avoid CloudFormation EarlyValidation Errors

If you see:

AWS::EarlyValidation::ResourceExistenceCheck
Status: FAILED
StackStatus: REVIEW_IN_PROGRESS

This usually means:

A resource name is hardcoded

That resource already exists

CloudFormation fails before stack creation

❌ DO NOT Hardcode These

Avoid hardcoding:

FunctionName:
LogGroupName:
BucketName:
RoleName:
ApiName:

Hardcoded names often cause collisions when:

A stack was previously deleted

A resource still exists

Multiple deploy attempts happened

✅ Recommended Pattern

Let CloudFormation generate names automatically.

Example (correct):

ApiFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: .
    Handler: wsgi_handler.handler

Do NOT set FunctionName unless absolutely required.

🧹 Clean Deployment Procedure

If deployment fails or stack gets stuck in:

REVIEW_IN_PROGRESS
1️⃣ Delete the stack
aws cloudformation delete-stack \
  --stack-name astroloqueer-prod \
  --region eu-central-1

aws cloudformation wait stack-delete-complete \
  --stack-name astroloqueer-prod \
  --region eu-central-1
2️⃣ Confirm it’s gone
aws cloudformation describe-stacks \
  --stack-name astroloqueer-prod \
  --region eu-central-1

Should return:

Stack with id astroloqueer-prod does not exist
3️⃣ Build & Deploy
sam build --use-container --clean
sam deploy --guided --stack-name astroloqueer-prod --region eu-central-1

After first guided deploy:

sam build --use-container --clean
sam deploy
🐍 OpenAI SDK Requirement (Responses API)

The backend uses:

gpt-5.1-chat-latest

and the Responses API.

Therefore, requirements.txt MUST contain:

openai>=2.0.0

If you forget this, Lambda will throw:

'OpenAI' object has no attribute 'responses'
🔐 Secrets Manager Variables

Environment variables resolve from:

AstroloqueerOpenAI

AstroloqueerGoogleMaps

Example:

OPENAI_API_KEY: '{{resolve:secretsmanager:AstroloqueerOpenAI:SecretString:OPENAI_API_KEY}}'

Make sure secrets exist in eu-central-1.

🧠 Git Safety Workflow (Prevent Accidental Refactors on main)

When experimenting:

Before risky changes:
git stash push -u -m "WIP"
If main gets messy:
git fetch origin
git reset --hard origin/main
Recover accidental commit:
git reflog
git branch rescue_branch <hash>

Never deploy from a dirty working tree.

🧨 Common Failure Causes
Error	Cause	Fix
EarlyValidation	Hardcoded resource name	Remove name
LogGroup already exists	Explicit LogGroup resource	Remove or rename
Responses attribute missing	Old OpenAI SDK	Upgrade requirements
Stack stuck REVIEW_IN_PROGRESS	Failed changeset	Delete stack
📦 Build Output Location

After build:

.aws-sam/build/

This is what gets deployed.

🏗 Production Philosophy

Let CloudFormation generate names.

Keep main always deployable.

Do refactors in feature branches.

Deploy only after clean reset to origin/main.