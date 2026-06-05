# ──────────────────────────────────────────────────────────────────────────────
# Azure Resource Setup for InterviewerHelp
# 使用 CareerOS 同一訂閱 (25f66d25) 下建立獨立 Resource Group
# ──────────────────────────────────────────────────────────────────────────────

param(
    [string]$ResourceGroup = "rg-interviewerhelp",
    [string]$Location = "eastasia",
    [string]$StorageAccount = "interviewerhelpstor",
    [string]$Subscription = "25f66d25-7cb7-4013-920f-c3ee66327b68",
    [string]$Tenant = "aa76aa1f-bc61-4cad-b3df-32ff83a7f2c8"
)

Write-Host "=== InterviewerHelp Azure Resource Setup ===" -ForegroundColor Cyan

# 1. Login to correct tenant
Write-Host "`n[1/5] Logging in to tenant $Tenant..." -ForegroundColor Yellow
az login --tenant $Tenant
az account set --subscription $Subscription
Write-Host "Active subscription: $(az account show --query name -o tsv)"

# 2. Create Resource Group
Write-Host "`n[2/5] Creating Resource Group: $ResourceGroup in $Location..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location

# 3. Create Storage Account (for Table + Blob)
Write-Host "`n[3/5] Creating Storage Account: $StorageAccount..." -ForegroundColor Yellow
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
Write-Host "`n[4/5] Creating blob container: candidate-cvs..." -ForegroundColor Yellow
az storage container create `
    --name "candidate-cvs" `
    --account-name $StorageAccount `
    --auth-mode login

# 5. Output .env.local template
Write-Host "`n[5/5] Generating .env.local..." -ForegroundColor Yellow

# Reuse CareerOS Azure OpenAI endpoint (same model, different prompt)
$envContent = @"
# Azure OpenAI (shared with CareerOS)
AZURE_OPENAI_ENDPOINT=https://wecar-mm61zh57-eastus2.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY=<COPY_FROM_CAREEROS_.env.local>
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-5.4-mini

# Azure Storage (InterviewerHelp dedicated)
AZURE_STORAGE_CONNECTION_STRING=$connStr

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
"@

$envPath = Join-Path $PSScriptRoot ".." ".env.local"
$envContent | Out-File -FilePath $envPath -Encoding utf8 -Force
Write-Host "`n.env.local written to: $envPath" -ForegroundColor Green
Write-Host "`n⚠️  記得從 CareerOS .env.local 複製 AZURE_OPENAI_API_KEY 過來！" -ForegroundColor Red

Write-Host "`n=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "Next steps:"
Write-Host "  1. Copy AZURE_OPENAI_API_KEY from CareerOS .env.local"
Write-Host "  2. cd C:\Jeffwang\project\interviewerhelp"
Write-Host "  3. npm run dev"
