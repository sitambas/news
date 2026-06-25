#!/usr/bin/env bash
# Shared deployment settings — source from other deploy scripts

export AWS_REGION="${AWS_REGION:-ap-south-1}"
export EC2_HOST="${EC2_HOST:-13.215.161.54}"
export EC2_USER="${EC2_USER:-ubuntu}"
export APP_NAME="${APP_NAME:-news}"
export APP_DIR="${APP_DIR:-/home/ubuntu/news}"
export KEY_PATH="${KEY_PATH:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/keypair/hyperledger_test.pem}"
export DOMAIN="${DOMAIN:-cgfile.in}"
export SSL_EMAIL="${SSL_EMAIL:-admin@cgfile.in}"
