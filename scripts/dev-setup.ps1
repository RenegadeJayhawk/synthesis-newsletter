# Dev setup helper for Windows PowerShell
# - Verifies Node version is >=18
# - Runs `npm ci` to install dependencies

$requiredMajor = 18

try {
    $nodeVersion = (node -v).TrimStart("v")
} catch {
    Write-Error "Node is not installed or not in PATH. Please install Node 18+ and re-run this script."
    exit 1
}

$parts = $nodeVersion.Split('.')
$major = [int]$parts[0]

if ($major -lt $requiredMajor) {
    Write-Error "Node version $nodeVersion found. Please install Node $requiredMajor or later."
    exit 1
}

Write-Host "Node $nodeVersion detected. Installing dependencies with npm ci..."

$exit = npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm ci failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "Dependencies installed successfully."