#!/usr/bin/env bash
# Shared deployment settings — source from other deploy scripts

export AWS_REGION="${AWS_REGION:-eu-north-1}"
export EC2_HOST="${EC2_HOST:-ec2-16-170-201-214.eu-north-1.compute.amazonaws.com}"
export EC2_USER="${EC2_USER:-ubuntu}"
export APP_NAME="${APP_NAME:-news}"
export APP_DIR="${APP_DIR:-/home/ubuntu/news}"
export KEY_PATH="${KEY_PATH:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/keypair/cgfile.pem}"
