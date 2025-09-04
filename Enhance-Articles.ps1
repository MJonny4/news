# Article Content Enhancement Script using Claude CLI
# Usage: .\Enhance-Articles.ps1 -ArticlesFolder ".\src\articles" -EnhancementType "expand"

param(
    [Parameter(Mandatory=$false)]
    [string]$ArticlesFolder = ".\src\articles",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("expand", "rewrite", "improve")]
    [string]$EnhancementType = "expand",
    
    [Parameter(Mandatory=$false)]
    [string]$Keyword = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$UpdateOriginals = $false
)

Write-Host "Starting article content enhancement with Claude CLI..." -ForegroundColor Cyan

# Check if Claude CLI is available
try {
    $claudeVersion = claude --version 2>$null
    if (-not $claudeVersion) {
        throw "Claude CLI not found"
    }
    Write-Host "Claude CLI detected: $claudeVersion" -ForegroundColor Green
}
catch {
    Write-Error "Claude CLI is not installed or not in PATH. Please install Claude CLI first."
    Write-Host "Install with: npm install -g @anthropic-ai/cli" -ForegroundColor Yellow
    exit 1
}

# Function to read all articles from folders
function Get-AllArticles {
    param([string]$basePath)
    
    $allArticles = @()
    
    # Get source folders (newsapi, guardian, alphavantage)
    $sourceFolders = Get-ChildItem -Path $basePath -Directory | Where-Object { $_.Name -match "^(newsapi|guardian|alphavantage)$" }
    
    foreach ($folder in $sourceFolders) {
        $articles = Get-ChildItem -Path $folder.FullName -Filter "*.md" | ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            
            # Parse frontmatter
            $frontmatterMatch = $content -match '(?s)^---\r?\n(.*?)\r?\n---'
            $frontmatter = @{}
            if ($frontmatterMatch) {
                $frontmatterText = $matches[1]
                $frontmatterText -split "`n" | ForEach-Object {
                    if ($_ -match '^(\w+):\s*"?([^"]*)"?$') {
                        $frontmatter[$matches[1]] = $matches[2]
                    }
                }
            }
            
            [PSCustomObject]@{
                Source = $folder.Name
                File = $_.Name
                Path = $_.FullName
                Content = $content
                Frontmatter = $frontmatter
            }
        }
        $allArticles += $articles
    }
    
    return $allArticles
}

# Function to extract content sections from markdown
function Get-ArticleSections {
    param([string]$content)
    
    $lines = $content -split "`n"
    $afterFrontmatter = $false
    $sections = @{
        Title = ""
        Summary = ""
        Content = ""
        FullText = ""
    }
    
    $currentSection = ""
    $contentLines = @()
    
    foreach ($line in $lines) {
        if ($line -match '^---$' -and -not $afterFrontmatter) {
            $afterFrontmatter = $true
            continue
        } elseif ($line -match '^---$' -and $afterFrontmatter) {
            continue
        }
        
        if ($afterFrontmatter) {
            if ($line -match '^#\s+(.+)$') {
                $sections.Title = $matches[1]
                $currentSection = "title"
            } elseif ($line -match '^##\s+Summary$') {
                $currentSection = "summary"
            } elseif ($line -match '^##\s+Content$') {
                $currentSection = "content"
            } elseif ($line -match '^##\s+') {
                $currentSection = "other"
            } elseif ($currentSection -eq "summary" -and $line.Trim()) {
                $sections.Summary += $line + "`n"
            } elseif ($currentSection -eq "content" -and $line.Trim()) {
                $sections.Content += $line + "`n"
            }
            
            $contentLines += $line
        }
    }
    
    $sections.FullText = $contentLines -join "`n"
    return $sections
}

# Function to enhance article content
function Enhance-ArticleContent {
    param([object]$article, [string]$enhancementType)
    
    $sections = Get-ArticleSections -content $article.Content
    $title = $article.Frontmatter.title
    $source = $article.Frontmatter.source
    
    $enhancementPrompt = switch ($enhancementType) {
        "expand" { 
            "Expand and enrich the content with additional context, analysis, and insights. Keep the same tone and style but make it more comprehensive and valuable to readers. Add relevant background information, explain technical terms, and provide deeper analysis of the implications." 
        }
        "rewrite" { 
            "Completely rewrite the content to be more engaging, well-structured, and professional while maintaining all the factual information. Improve flow, clarity, and readability." 
        }
        "improve" { 
            "Improve the existing content by fixing grammar, enhancing clarity, improving structure, and making it more compelling while keeping the core information intact." 
        }
    }
    
    $keywordFocus = if ($Keyword) { "Pay special attention to content related to '$Keyword' and expand on those aspects." } else { "" }
    
    $prompt = @"
I need you to enhance this news article content. Here are the details:

**Article Title:** $title
**Source:** $source
**Enhancement Type:** $enhancementType

**Current Summary:**
$($sections.Summary)

**Current Content:**
$($sections.Content)

**Instructions:**
$enhancementPrompt

$keywordFocus

**Requirements:**
1. Maintain all factual accuracy - do not add fictional information
2. Keep the professional news article tone
3. Expand the content to be more informative and engaging
4. Structure with clear paragraphs and good flow
5. Do not include headers (##) in your response - just provide the enhanced content text
6. Focus on expanding the "Content" section specifically - make it more detailed and valuable

Please provide only the enhanced content text (what should go in the ## Content section):
"@

    return $prompt
}

# Function to update article file with enhanced content
function Update-ArticleFile {
    param([object]$article, [string]$enhancedContent)
    
    # Read original content and replace the Content section
    $originalContent = $article.Content
    $sections = Get-ArticleSections -content $originalContent
    
    # Find the Content section and replace it
    $lines = $originalContent -split "`n"
    $newLines = @()
    $inContentSection = $false
    $contentSectionFound = $false
    
    foreach ($line in $lines) {
        if ($line -match '^##\s+Content$') {
            $newLines += $line
            $newLines += ""
            $newLines += $enhancedContent.Trim() -split "`n"
            $inContentSection = $true
            $contentSectionFound = $true
        } elseif ($line -match '^##\s+' -and $inContentSection) {
            $inContentSection = $false
            $newLines += ""
            $newLines += $line
        } elseif ($line -match '^---$' -and $contentSectionFound -and -not $inContentSection) {
            $newLines += ""
            $newLines += $line
        } elseif (-not $inContentSection) {
            $newLines += $line
        }
    }
    
    $newContent = $newLines -join "`n"
    
    if ($UpdateOriginals) {
        Set-Content -Path $article.Path -Value $newContent -Encoding UTF8
        Write-Host "Updated: $($article.File)" -ForegroundColor Green
    } else {
        $enhancedPath = $article.Path -replace '\.md$', '-enhanced.md'
        Set-Content -Path $enhancedPath -Value $newContent -Encoding UTF8
        Write-Host "Created enhanced version: $(Split-Path $enhancedPath -Leaf)" -ForegroundColor Green
    }
}

# Main execution
Write-Host "Reading articles from $ArticlesFolder..." -ForegroundColor Yellow
$articles = Get-AllArticles -basePath $ArticlesFolder

if ($articles.Count -eq 0) {
    Write-Warning "No articles found in $ArticlesFolder"
    Write-Host "Run Get-NewsArticles.ps1 first to fetch articles." -ForegroundColor Yellow
    exit 1
}

Write-Host "Found $($articles.Count) articles to enhance" -ForegroundColor Green

$processedCount = 0
$successCount = 0

foreach ($article in $articles) {
    $processedCount++
    Write-Host "`n[$processedCount/$($articles.Count)] Enhancing: $($article.Frontmatter.title)" -ForegroundColor Cyan
    
    try {
        # Generate enhancement prompt
        $prompt = Enhance-ArticleContent -article $article -enhancementType $EnhancementType
        
        # Call Claude CLI directly with prompt as argument
        Write-Host "Enhancing content with Claude..." -ForegroundColor Yellow
        $enhancedContent = claude $prompt
        
        if ($LASTEXITCODE -ne 0) {
            throw "Claude CLI returned error code $LASTEXITCODE"
        }
        
        # Update the article file
        Update-ArticleFile -article $article -enhancedContent $enhancedContent
        $successCount++
        
        # Brief pause to avoid rate limits
        Start-Sleep -Milliseconds 500
        
    } catch {
        Write-Warning "Failed to enhance $($article.File): $($_.Exception.Message)"
    }
}

Write-Host "`nContent enhancement complete!" -ForegroundColor Magenta
Write-Host "Successfully enhanced: $successCount/$($articles.Count) articles" -ForegroundColor Green

if (-not $UpdateOriginals) {
    Write-Host "Enhanced versions saved with '-enhanced.md' suffix" -ForegroundColor Cyan
    Write-Host "Use -UpdateOriginals switch to modify original files directly" -ForegroundColor Cyan
}