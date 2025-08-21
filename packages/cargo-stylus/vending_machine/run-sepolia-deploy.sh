#!/bin/bash\

# Load environment variables from .env file
if [ -f .env ]; then
  source .env
fi

# Exit immediately on any error
set -e

# Arbitrum Sepolia RPC URL
SEPOLIA_RPC_URL="https://sepolia-rollup.arbitrum.io/rpc"

# Ensure PRIVATE_KEY is set
if [[ -z "$PRIVATE_KEY" ]]; then
  echo "❌ Error: PRIVATE_KEY environment variable is not set."
  echo "Please run: export PRIVATE_KEY=your_private_key"
  exit 1
fi

# Check required tools
for cmd in cast cargo; do
  if ! command -v $cmd &> /dev/null; then
    echo "❌ Error: Required command '$cmd' is not installed."
    exit 1
  fi
done

# Check Arbitrum Sepolia connectivity
echo "🔌 Checking connection to Arbitrum Sepolia..."
if ! curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}' \
  "$SEPOLIA_RPC_URL" > /dev/null; then
  echo "❌ Error: Cannot connect to Arbitrum Sepolia RPC"
  exit 1
fi
echo "✅ Connected to Arbitrum Sepolia."

# Deploy the vending machine contract
echo "🚀 Deploying Vending Machine contract using cargo stylus..."
deploy_output=$(cargo stylus deploy -e "$SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY" --no-verify 2>&1)

# Check deployment success
if [[ $? -ne 0 ]]; then
  echo "❌ Error: Contract deployment failed"
  echo "Output:"
  echo "$deploy_output"
  exit 1
fi

# Extract transaction hash
deployment_tx=$(echo "$deploy_output" | grep -i "transaction\|tx" | grep -oE '0x[a-fA-F0-9]{64}' | head -1)
if [[ -z "$deployment_tx" ]]; then
  deployment_tx=$(echo "$deploy_output" | grep -oE '0x[a-fA-F0-9]{64}' | head -1)
fi

# Extract contract address
contract_address=$(echo "$deploy_output" | grep -i "contract\|deployed" | grep -oE '0x[a-fA-F0-9]{40}' | head -1)
if [[ -z "$contract_address" ]]; then
  contract_address=$(echo "$deploy_output" | grep -oE '0x[a-fA-F0-9]{40}' | head -1)
fi

# Validate results
if [[ -z "$deployment_tx" ]]; then
  echo "❌ Error: Could not extract deployment transaction hash."
  echo "$deploy_output"
  exit 1
fi

echo "✅ Vending Machine contract deployed!"
echo "📄 Transaction Hash: $deployment_tx"
if [[ ! -z "$contract_address" ]]; then
  echo "🏠 Contract Address: $contract_address"
fi

# Generate ABI
echo "📦 Generating ABI for the Vending Machine contract..."
cargo stylus export-abi > stylus-contract.abi

if [[ $? -ne 0 ]]; then
  echo "❌ Error: ABI generation failed."
  exit 1
fi

echo "✅ ABI saved to stylus-contract.abi"

# Save deployment metadata
mkdir -p build
echo "{
  \"network\": \"arbitrum-sepolia\",
  \"contract\": \"vending-machine\",
  \"contract_address\": \"$contract_address\",
  \"transaction_hash\": \"$deployment_tx\",
  \"rpc_url\": \"$SEPOLIA_RPC_URL\",
  \"deployment_time\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
}" > build/vending-machine-deployment-info.json

echo "📁 Deployment info saved to build/vending-machine-deployment-info.json"
echo "🎉 Vending Machine deployed successfully on Arbitrum Sepolia!"
