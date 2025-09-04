# News Extraction Script for Astro Integration
# Usage: .\Get-NewsArticles.ps1 -Keyword "solana" -ArticleCount 10 -NewsType "financial"

param(
    [Parameter(Mandatory=$true)]
    [string]$Keyword,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("financial", "general", "keyword")]
    [string]$NewsType = "general",
    
    [Parameter(Mandatory=$false)]
    [ValidateRange(1, 20)]
    [int]$ArticlesPerSource = 5,
    
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

# Function to generate unique ID
function Get-UniqueArticleId {
    param([string]$title, [string]$source, [string]$publishedAt)
    
    # Create a unique string from title + source + date
    $uniqueString = "$title-$source-$publishedAt" -replace '[^\w\s-]', '' -replace '\s+', '-'
    
    # Generate a short hash
    $hash = [System.Security.Cryptography.MD5]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($uniqueString))
    $hashString = [System.BitConverter]::ToString($hash) -replace '-', ''
    
    # Return first 8 characters + source prefix
    return "$($source.ToLower())-$($hashString.Substring(0, 8).ToLower())"
}

# Function to convert to markdown with frontmatter
function ConvertTo-MarkdownArticle {
    param(
        [PSCustomObject]$Article,
        [string]$Source,
        [string]$ArticleId
    )
    
    # Clean up title and other text fields for proper encoding
    $cleanTitle = (Clean-TextEncoding ($Article.title -replace '"', '\"'))
    $cleanAuthor = (Clean-TextEncoding $Article.author)
    
    $frontmatter = @"
---
id: "$ArticleId"
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
    
    $sources = if ($NewsType -eq "financial") { "&sources=bloomberg,reuters,financial-times,the-wall-street-journal" } else { "" }
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
    
    # Map keywords to appropriate topics or tickers
    $topicOrTicker = switch -Wildcard ($query.ToLower()) {
        "*bitcoin*" { "tickers=BTC" }
        "*ethereum*" { "tickers=ETH" }
        "*solana*" { "topics=cryptocurrency" }
        "*crypto*" { "topics=cryptocurrency" }
        "*finance*" { "topics=finance" }
        "*market*" { "topics=finance" }
        default { "topics=technology" }
    }
    
    $url = "https://www.alphavantage.co/query?function=NEWS_SENTIMENT&$topicOrTicker&limit=$limit&apikey=$AlphaVantageKey"
    
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
$totalExpectedArticles = if ($NewsType -eq "financial") { $ArticlesPerSource * 3 } else { $ArticlesPerSource * 2 }
Write-Host "Fetching $ArticlesPerSource articles per source about '$Keyword' ($NewsType news)..." -ForegroundColor Cyan

# Organize articles by source
$articlesBySource = @{}

# Fetch from each source
Write-Host "Fetching from NewsAPI..." -ForegroundColor Yellow
$newsApiArticles = Get-NewsAPIArticles -query $Keyword -pageSize $ArticlesPerSource
$articlesBySource["NewsAPI"] = $newsApiArticles | ForEach-Object { 
    $_ | Add-Member -NotePropertyName "source_api" -NotePropertyValue "NewsAPI" -PassThru 
} | Select-Object -First $ArticlesPerSource

Write-Host "Fetching from The Guardian..." -ForegroundColor Yellow  
$guardianArticles = Get-GuardianArticles -query $Keyword -pageSize $ArticlesPerSource
$articlesBySource["Guardian"] = $guardianArticles | ForEach-Object {
    $_ | Add-Member -NotePropertyName "source_api" -NotePropertyValue "Guardian" -PassThru
} | Select-Object -First $ArticlesPerSource

if ($NewsType -eq "financial") {
    Write-Host "Fetching from Alpha Vantage..." -ForegroundColor Yellow
    $alphaArticles = Get-AlphaVantageNews -query $Keyword -limit $ArticlesPerSource  
    $articlesBySource["AlphaVantage"] = $alphaArticles | ForEach-Object {
        $_ | Add-Member -NotePropertyName "source_api" -NotePropertyValue "AlphaVantage" -PassThru
    } | Select-Object -First $ArticlesPerSource
}

# Combine all articles for overall processing
$allArticles = @()
foreach ($source in $articlesBySource.Keys) {
    $allArticles += $articlesBySource[$source]
}

Write-Host "Saving $($allArticles.Count) articles to markdown files..." -ForegroundColor Green

# Create separate folders for each source
foreach ($source in $articlesBySource.Keys) {
    $sourceFolder = Join-Path $OutputFolder $source.ToLower()
    if (!(Test-Path $sourceFolder)) {
        New-Item -ItemType Directory -Path $sourceFolder -Force
    }
}

# Save articles organized by source
foreach ($source in $articlesBySource.Keys) {
    $sourceArticles = $articlesBySource[$source]
    $sourceFolder = Join-Path $OutputFolder $source.ToLower()
    
    Write-Host "Saving $($sourceArticles.Count) articles from $source..." -ForegroundColor Green
    
    foreach ($article in $sourceArticles) {
        # Generate unique ID for this article
        $articleId = Get-UniqueArticleId -title $article.title -source $article.source_api -publishedAt $article.publishedAt
        
        # Use ID as filename for cleaner URLs
        $fileName = "$articleId.md"
        $filePath = Join-Path $sourceFolder $fileName
        
        $markdownContent = ConvertTo-MarkdownArticle -Article $article -Source $article.source_api -ArticleId $articleId
        Set-Content -Path $filePath -Value $markdownContent -Encoding UTF8
        
        Write-Host "Saved: $source/$fileName (ID: $articleId)" -ForegroundColor Green
    }
}

Write-Host "`nComplete! $($allArticles.Count) articles saved to $OutputFolder" -ForegroundColor Cyan
Write-Host "Articles organized by source: $($articlesBySource.Keys -join ', ')" -ForegroundColor Magenta

# Generate index file for Astro with source breakdown
$sourceBreakdown = ""
foreach ($source in $articlesBySource.Keys) {
    $sourceArticles = $articlesBySource[$source]
    $sourceBreakdown += @"

### $source ($($sourceArticles.Count) articles)
$($sourceArticles | ForEach-Object { 
    $title = if ($_.title) { $_.title } else { "Untitled" }
    $articleId = Get-UniqueArticleId -title $_.title -source $_.source_api -publishedAt $_.publishedAt
    "- [$title]($($source.ToLower())/$articleId.md) (ID: $articleId)"
} | Out-String)
"@
}

$indexContent = @"
# News Articles - $Keyword

Generated on: $(Get-Date)
Keyword: **$Keyword**
News Type: **$NewsType**
Total Articles: **$($allArticles.Count)**

## Articles by Source
$sourceBreakdown
"@

Set-Content -Path (Join-Path $OutputFolder "index.md") -Value $indexContent -Encoding UTF8
Write-Host "Ready for Astro integration!" -ForegroundColor Green