# ──────────────────────────────────────────────────────────────────────────────
# Azure Resource Setup for InterviewerHelp
# Subscription: 3f899126-... (Visual Studio Enterprise)
# Tenant:       e0450666-...
# 完全獨立資源 — 不與 CareerOS 共用
# ──────────────────────────────────────────────────────────────────────────────

param(
    [string]$ResourceGroup      = "rg-interviewerhelp",
    [string]$Location           = "eastasia",
    [string]$StorageAccount     = "interviewerhelpstor",
    [string]$OpenAIAccount      = "aoai-interviewerhelp",
    [string]$OpenAILocation     = "eastus2",
    [string]$OpenAIDeployment   = "gpt-5.4-mini",
    [string]$OpenAIModel        = "gpt-5.4-mini",
    [string]$OpenAIModelVersion = "2026-03-17",
    [string]$Subscription       = "3f899126-8896-4c0a-bdec-cbede0f3032c",
    [string]$Tenant             = "e0450666-82f8-43c3-b9b8-a232d11be327"
)

Write-Host "=== InterviewerHelp Azure Resource Setup ===" -ForegroundColor Cyan

# 1. Login to correct tenant
Write-Host "`n[1/6] Logging in to tenant $Tenant..." -ForegroundColor Yellow
az login --tenant $Tenant
az account set --subscription $Subscription
Write-Host "Active subscription: $(az account show --query name -o tsv)"

# 2. Create Resource Group
Write-Host "`n[2/6] Creating Resource Group: $ResourceGroup in $Location..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location

# 3. Create Storage Account (for Table + Blob)
Write-Host "`n[3/6] Creating Storage Account: $StorageAccount..." -ForegroundColor Yellow
az storage account create `
    --name $StorageAccount `
    --resource-group $ResourceGroup `
    --location $Location `
    --sku Standard_LRS `
    --kind StorageV2 `
    --min-tls-version TLS1_2

# Get connection string
$connStr = az storage account show-connection-string `
    --name $StorageAccount `
    --resource-group $ResourceGroup `
    --query connectionString -o tsv

Write-Host "Storage Connection String: $connStr" -ForegroundColor Green

# 4. Create Blob container for CV files
Write-Host "`n[4/6] Creating blob container: candidate-cvs..." -ForegroundColor Yellow
az storage container create `
    --name "candidate-cvs" `
    --account-name $StorageAccount `
    --auth-mode login

# 5. Create dedicated Azure OpenAI account + deployment
Write-Host "`n[5/6] Creating Azure OpenAI account: $OpenAIAccount in $OpenAILocation..." -ForegroundColor Yellow
az cognitiveservices account create `
    --name $OpenAIAccount `
    --resource-group $ResourceGroup `
    --location $OpenAILocation `
    --kind OpenAI `
    --sku S0 `
    --yes

Write-Host "Creating model deployment: $OpenAIDeployment ($OpenAIModel v$OpenAIModelVersion)..." -ForegroundColor Yellow
az cognitiveservices account deployment create `
    --name $OpenAIAccount `
    --resource-group $ResourceGroup `
    --deployment-name $OpenAIDeployment `
    --model-name $OpenAIModel `
    --model-version $OpenAIModelVersion `
    --model-format OpenAI `
    --sku-capacity 50 `
    --sku-name "GlobalStandard"

$openaiEndpoint = az cognitiveservices account show `
    --name $OpenAIAccount `
    --resource-group $ResourceGroup `
    --query "properties.endpoint" -o tsv

$openaiKey = az cognitiveservices account keys list `
    --name $OpenAIAccount `
    --resource-group $ResourceGroup `
    --query "key1" -o tsv

Write-Host "OpenAI Endpoint: $openaiEndpoint" -ForegroundColor Green

# 6. Output .env.local
Write-Host "`n[6/6] Generating .env.local..." -ForegroundColor Yellow

$envContent = @"
# Azure OpenAI (InterviewerHelp dedicated)
AZURE_OPENAI_ENDPOINT=$openaiEndpoint
AZURE_OPENAI_API_KEY=$openaiKey
AZURE_OPENAI_DEPLOYMENT_NAME=$OpenAIDeployment

# Azure Storage (InterviewerHelp dedicated)
AZURE_STORAGE_CONNECTION_STRING=$connStr

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
"@

$envPath = Join-Path $PSScriptRoot ".." ".env.local"
$envContent | Out-File -FilePath $envPath -Encoding utf8 -Force
Write-Host "`n.env.local written to: $envPath" -ForegroundColor Green

Write-Host "`n=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "Next steps:"
Write-Host "  1. cd C:\Jeffwang\project\interviewerhelp"
Write-Host "  2. npm run dev"
Write-Host "`nNote: 若 model $OpenAIModel v$OpenAIModelVersion 在 $OpenAILocation 沒有 quota，"
Write-Host "      請改參數 -OpenAILocation 或 -OpenAIModel/-OpenAIModelVersion 後重跑。"
