#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=config.sh
source "$SCRIPT_DIR/config.sh"

if ! command -v aws >/dev/null 2>&1; then
  echo "AWS CLI not found. Install it:"
  echo "  brew install awscli"
  echo "  aws configure"
  exit 1
fi

if ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "AWS CLI is not configured. Run:"
  echo "  aws configure"
  echo "Enter your Access Key ID, Secret Access Key, and region: $AWS_REGION"
  exit 1
fi

echo "==> AWS account"
aws sts get-caller-identity

echo
echo "==> EC2 instances in $AWS_REGION"
aws ec2 describe-instances \
  --region "$AWS_REGION" \
  --filters "Name=instance-state-name,Values=running,stopped,pending" \
  --query 'Reservations[].Instances[].[InstanceId,State.Name,PublicDnsName,PublicIpAddress,Tags[?Key==`Name`].Value|[0]]' \
  --output table

echo
echo "==> Security groups (check inbound rules for ports 22, 80, 443)"
aws ec2 describe-security-groups \
  --region "$AWS_REGION" \
  --query 'SecurityGroups[].[GroupId,GroupName,IpPermissions[?FromPort==\`22\` || FromPort==\`80\` || FromPort==\`443\`]]' \
  --output table 2>/dev/null || \
aws ec2 describe-security-groups --region "$AWS_REGION" --output table

echo
echo "Required inbound rules on your EC2 security group:"
echo "  SSH  (22)  -> Your IP only"
echo "  HTTP (80)  -> 0.0.0.0/0"
echo "  HTTPS(443) -> 0.0.0.0/0 (optional, for SSL later)"
