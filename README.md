# Financial News Hub

A modern Astro-based news aggregation platform that fetches articles from multiple financial news APIs and enhances them using Claude AI. Articles are organized by source with clean ID-based routing and a beautiful glassmorphism UI.

## PowerShell Scripts Documentation

### 1. Get-NewsArticles.ps1

Fetches financial news articles from multiple APIs and organizes them by source with unique ID-based filenames.

#### Usage
```powershell
.\Get-NewsArticles.ps1 -Keyword "crypto" -NewsType "financial" -ArticlesPerSource 5
```

#### Parameters
| Parameter | Description | Options | Default |
|-----------|-------------|---------|---------|
| `Keyword` | Search term for articles | Any string | **Required** |
| `NewsType` | Type of news to fetch | `financial`, `general`, `keyword` | `general` |
| `ArticlesPerSource` | Number of articles per API source | 1-20 | `5` |
| `OutputFolder` | Where to save articles | Any path | `.\src\articles` |

#### Features
- **Multi-Source Fetching**: NewsAPI, The Guardian, Alpha Vantage
- **Smart API Mapping**: Automatically maps keywords to appropriate API parameters
- **ID-Based Filenames**: Generates clean, collision-free IDs (e.g., `newsapi-84e6c491.md`)
- **Source Organization**: Articles saved in separate folders (`newsapi/`, `guardian/`, `alphavantage/`)
- **Rich Frontmatter**: Each article includes ID, title, source, URL, author, keywords

#### Examples
```powershell
# Fetch 3 crypto articles from each source
.\Get-NewsArticles.ps1 -Keyword "crypto" -NewsType "financial" -ArticlesPerSource 3

# General tech news
.\Get-NewsArticles.ps1 -Keyword "AI" -NewsType "general" -ArticlesPerSource 10

# Market analysis
.\Get-NewsArticles.ps1 -Keyword "market" -NewsType "financial" -ArticlesPerSource 2
```

#### Output Structure
```
src/articles/
├── newsapi/
│   ├── newsapi-84e6c491.md
│   └── newsapi-da2f637e.md
├── guardian/
│   ├── guardian-d39e0f8a.md
│   └── guardian-883ce521.md
├── alphavantage/
│   ├── alphavantage-d86d9320.md
│   └── alphavantage-d2792dc3.md
└── index.md
```

---

### 2. Enhance-Articles.ps1

Enhances article content using Claude CLI to make articles more comprehensive, detailed, and valuable to readers.

#### Prerequisites
```bash
# Install Claude CLI
npm install -g @anthropic-ai/cli

# Authenticate with Claude
claude auth
```

#### Usage
```powershell
.\Enhance-Articles.ps1 -EnhancementType "expand" -Keyword "crypto"
```

#### Parameters
| Parameter | Description | Options | Default |
|-----------|-------------|---------|---------|
| `ArticlesFolder` | Folder containing articles | Any path | `.\src\articles` |
| `EnhancementType` | Type of enhancement | `expand`, `rewrite`, `improve` | `expand` |
| `Keyword` | Focus keyword for enhancement | Any string | None |
| `UpdateOriginals` | Modify original files | Switch (true/false) | `false` |

#### Enhancement Types
- **`expand`** - Adds context, analysis, background information, and deeper insights
- **`rewrite`** - Complete rewrite for better engagement and structure  
- **`improve`** - Grammar fixes, clarity improvements, and better flow

#### Features
- **Safe by Default**: Creates `-enhanced.md` copies unless `-UpdateOriginals` is used
- **Content-Focused**: Only enhances the `## Content` section, preserves summaries
- **Batch Processing**: Handles all articles automatically with progress tracking
- **Rate Limiting**: Built-in delays to respect Claude API limits
- **Error Handling**: Continues processing even if some articles fail

#### Examples
```powershell
# Expand content with more details and context
.\Enhance-Articles.ps1 -EnhancementType "expand" -Keyword "crypto"

# Rewrite articles for better engagement
.\Enhance-Articles.ps1 -EnhancementType "rewrite" -UpdateOriginals

# Improve grammar and structure only
.\Enhance-Articles.ps1 -EnhancementType "improve"

# Focus enhancement on specific topic
.\Enhance-Articles.ps1 -EnhancementType "expand" -Keyword "blockchain"
```

#### Safety Features
- **Backup Creation**: Original content preserved in `-enhanced.md` files
- **Factual Accuracy**: Claude instructions emphasize maintaining factual information
- **Graceful Failure**: Script continues if individual articles fail to enhance
- **Progress Tracking**: Shows enhancement progress with success/failure counts

---

## Complete Workflow

### 1. Initial Setup
```bash
npm install
```

### 2. Fetch Articles
```powershell
.\Get-NewsArticles.ps1 -Keyword "cryptocurrency" -NewsType "financial" -ArticlesPerSource 5
```

### 3. Enhance Content (Optional)
```powershell
.\Enhance-Articles.ps1 -EnhancementType "expand" -Keyword "cryptocurrency"
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. View Results
Navigate to `http://localhost:4321` to see your enhanced financial news hub.

## Article URL Structure
- **Clean IDs**: `/articles/newsapi-84e6c491`
- **Source-Based**: Each article ID includes source prefix
- **SEO Friendly**: Short, consistent URLs
- **Collision-Free**: Hash-based IDs prevent duplicates

## API Configuration
Environment variables in `.env`:
- `NEWSAPIORG` - NewsAPI.org API key
- `THEGUARDIANOPENPLATFORM` - Guardian API key  
- `ALPHAVANTAGE` - Alpha Vantage API key

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |