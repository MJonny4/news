# News Extraction Script for Astro Integration
# Usage: .\Get-NewsArticles.ps1 -Keyword "solana" -ArticleCount 10 -NewsType "financial"

param(
    [Parameter(Mandatory=$true)]
    [string]$Keyword,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("financial", "general", "keyword")]
    [string]$NewsType = "general",
    
    [Parameter(Mandatory=$false)]
    [ValidateRange(1, 100)]
    [int]$ArticleCount = 5,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputFolder = ".\src\articles"
)

# Load environment variables from .env file
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match '(.+?)="(.+?)"') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

# API Keys (set these as environment variables)
$NewsAPIKey = $env:NEWSAPIORG
$GuardianAPIKey = $env:THEGUARDIANOPENPLATFORM  
$AlphaVantageKey = $env:ALPHAVANTAGE

# Create output folder if it doesn't exist
if (!(Test-Path $OutputFolder)) {
    New-Item -ItemType Directory -Path $OutputFolder -Force
}

# Function to sanitize filename
function Get-SafeFileName {
    param([string]$fileName)
    $invalidChars = [IO.Path]::GetInvalidFileNameChars() -join ''
    return $fileName -replace "[$invalidChars]", '_'
}

# Function to clean encoding issues
function Clean-TextEncoding {
    param([string]$text)
    if (-not $text) { return "" }
    
    # Replace common encoding issues
    $cleaned = $text
    $cleaned = $cleaned -replace '[^\x00-\x7F]', ' '  # Replace non-ASCII with space
    $cleaned = $cleaned -replace '\s+', ' '           # Clean multiple spaces
    $cleaned = $cleaned.Trim()
    
    return $cleaned
}

# Function to convert to markdown with frontmatter
function ConvertTo-MarkdownArticle {
    param(
        [PSCustomObject]$Article,
        [string]$Source
    )
    
    # Clean up title and other text fields for proper encoding
    $cleanTitle = (Clean-TextEncoding ($Article.title -replace '"', '\"'))
    $cleanAuthor = (Clean-TextEncoding $Article.author)
    
    $frontmatter = @"
---
title: "$cleanTitle"
source: "$Source"
publishedAt: "$($Article.publishedAt)"
url: "$($Article.url)"
author: "$cleanAuthor"
keyword: "$Keyword"
newsType: "$NewsType"
---

"@
    
    # Clean content and description
    $cleanDescription = (Clean-TextEncoding $Article.description)
    $cleanContent = (Clean-TextEncoding $Article.content)
    
    $content = @"
$frontmatter

# $cleanTitle

**Published:** $($Article.publishedAt)  
**Source:** $Source  
**Author:** $cleanAuthor

## Summary
$cleanDescription

## Content
$cleanContent

---
*Original article: [$cleanTitle]($($Article.url))*
"@
    
    return $content
}

# NewsAPI Request
function Get-NewsAPIArticles {
    param([string]$query, [int]$pageSize)
    
    $sources = if ($NewsType -eq "financial") { "&sources=reuters" } else { "" }
    $url = "https://newsapi.org/v2/everything?q=$query&pageSize=$pageSize&sortBy=publishedAt&apiKey=$NewsAPIKey&language=en$sources"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get
        return $response.articles
    }
    catch {
        Write-Warning "NewsAPI request failed: $($_.Exception.Message)"
        return @()
    }
}

# Guardian API Request
function Get-GuardianArticles {
    param([string]$query, [int]$pageSize)
    
    $section = if ($NewsType -eq "financial") { "&section=business" } else { "" }
    $url = "https://content.guardianapis.com/search?q=$query&page-size=$pageSize&show-fields=all&order-by=newest&api-key=$GuardianAPIKey$section"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get
        return $response.response.results | ForEach-Object {
            [PSCustomObject]@{
                title = $_.webTitle
                description = $_.fields.trailText
                content = $_.fields.bodyText
                url = $_.webUrl
                publishedAt = $_.webPublicationDate
                author = $_.fields.byline
            }
        }
    }
    catch {
        Write-Warning "Guardian API request failed: $($_.Exception.Message)"
        return @()
    }
}

# Alpha Vantage News Request
function Get-AlphaVantageNews {
    param([string]$query, [int]$limit)
    
    $url = "https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=$query&limit=$limit&apikey=$AlphaVantageKey"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get
        return $response.feed | ForEach-Object {
            [PSCustomObject]@{
                title = $_.title
                description = $_.summary
                content = $_.summary
                url = $_.url
                publishedAt = $_.time_published
                author = $_.source
            }
        }
    }
    catch {
        Write-Warning "Alpha Vantage request failed: $($_.Exception.Message)"
        return @()
    }
}

# Main execution
Write-Host "Fetching $ArticleCount articles about '$Keyword' ($NewsType news)..." -ForegroundColor Cyan

$allArticles = @()

# Calculate articles per source
$articlesPerSource = [Math]::Ceiling($ArticleCount / 3)

# Fetch from each source
Write-Host "Fetching from NewsAPI..." -ForegroundColor Yellow
$newsApiArticles = Get-NewsAPIArticles -query $Keyword -pageSize $articlesPerSource
$allArticles += $newsApiArticles | ForEach-Object { 
    $_ | Add-Member -NotePropertyName "source_api" -NotePropertyValue "NewsAPI" -PassThru 
}

Write-Host "Fetching from The Guardian..." -ForegroundColor Yellow  
$guardianArticles = Get-GuardianArticles -query $Keyword -pageSize $articlesPerSource
$allArticles += $guardianArticles | ForEach-Object {
    $_ | Add-Member -NotePropertyName "source_api" -NotePropertyValue "Guardian" -PassThru
}

if ($NewsType -eq "financial") {
    Write-Host "Fetching from Alpha Vantage..." -ForegroundColor Yellow
    $alphaArticles = Get-AlphaVantageNews -query $Keyword -limit $articlesPerSource  
    $allArticles += $alphaArticles | ForEach-Object {
        $_ | Add-Member -NotePropertyName "source_api" -NotePropertyValue "AlphaVantage" -PassThru
    }
}

# Sort by publication date and take top N
$topArticles = $allArticles | Sort-Object publishedAt -Descending | Select-Object -First $ArticleCount

Write-Host "Saving $($topArticles.Count) articles to markdown files..." -ForegroundColor Green

foreach ($article in $topArticles) {
    $safeTitle = if ($article.title) { $article.title } else { "Untitled-$(Get-Date -Format 'yyyyMMdd-HHmmss')" }
    $fileName = Get-SafeFileName -fileName "$($safeTitle.Substring(0, [Math]::Min(50, $safeTitle.Length)))"
    $fileName = "$fileName.md"
    $filePath = Join-Path $OutputFolder $fileName
    
    $markdownContent = ConvertTo-MarkdownArticle -Article $article -Source $article.source_api
    Set-Content -Path $filePath -Value $markdownContent -Encoding UTF8
    
    Write-Host "Saved: $fileName" -ForegroundColor Green
}

Write-Host "`nComplete! $($topArticles.Count) articles saved to $OutputFolder" -ForegroundColor Cyan
Write-Host "Ready for Astro integration!" -ForegroundColor Magenta

# Generate index file for Astro
$indexContent = @"
# News Articles - $Keyword

Generated on: $(Get-Date)
Keyword: **$Keyword**
News Type: **$NewsType**
Total Articles: **$($topArticles.Count)**

## Articles
$($topArticles | ForEach-Object { $title = if ($_.title) { $_.title } else { "Untitled" }; "- [$title]($((Get-SafeFileName $title.Substring(0, [Math]::Min(50, $title.Length))).md))" } | Out-String)
"@

Set-Content -Path (Join-Path $OutputFolder "index.md") -Value $indexContent -Encoding UTF8