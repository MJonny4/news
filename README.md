# Financial News Hub

A modern, scalable news aggregation platform built with TypeScript, Node.js, React, and MySQL. Fetch articles from multiple financial news APIs, manage them through a beautiful web interface, and enhance them using AI.

## 🚀 Features

- **Multi-Source News Fetching**: Integrated with NewsAPI, Guardian, and Alpha Vantage
- **Modern Tech Stack**: TypeScript, Node.js, Express, React, Vite, MySQL
- **Real-time Management**: Create fetch jobs, monitor progress, manage sources
- **Advanced Search & Filtering**: Full-text search with filters by source, category, news type
- **Beautiful UI**: Modern design with Tailwind CSS and custom components
- **Scalable Architecture**: Clean separation of concerns, proper error handling, caching

## 🛠 Tech Stack

### Backend
- **Node.js** with **TypeScript**
- **Express.js** for REST API
- **Prisma ORM** for database management
- **MySQL** for data storage
- **Axios** for API integrations
- **Zod** for validation

### Frontend
- **React 18** with **TypeScript**
- **Vite** for fast development
- **TanStack Query** for data fetching
- **React Hook Form** for forms
- **Tailwind CSS** for styling
- **React Router** for navigation

## 📦 Project Structure

```
├── backend/                 # Node.js TypeScript API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── services/        # Business logic & API integrations
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Validation, error handling
│   │   ├── config/          # Database configuration
│   │   └── types/           # TypeScript interfaces
│   └── prisma/             # Database schema
├── frontend/               # React Vite TypeScript
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript interfaces
└── database/              # MySQL setup scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- pnpm (recommended) or npm

### 1. Database Setup
```bash
# Import the database schema
mysql -u mjonny4 -p financial_news_hub < database/schema.sql
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Start development server
pnpm dev
```

The API will be available at `http://localhost:3001`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

The backend uses the following environment variables (already configured in `/backend/.env`):

```env
DATABASE_URL="mysql://mjonny4:mjonny4@localhost:3306/financial_news_hub"
PORT=3001
NODE_ENV=development

# API Keys (from root .env)
NEWSAPIORG="your_newsapi_key"
THEGUARDIANOPENPLATFORM="your_guardian_key" 
ALPHAVANTAGE="your_alphavantage_key"

FRONTEND_URL=http://localhost:5173
```

## 📱 Usage

### 1. Dashboard
- View article statistics and recent activity
- Monitor running fetch jobs
- See articles by source and type

### 2. Fetch Articles
- Create fetch jobs with custom keywords
- Select news type (Financial, General, Keyword-based)
- Choose number of articles per source
- Select active news sources

### 3. Manage Articles
- Browse all fetched articles with pagination
- Filter by source, category, news type
- Search articles by title, content, author
- Delete unwanted articles

### 4. Settings
- Enable/disable news sources
- Test API connections
- Manage categories

## 🔌 API Endpoints

### Articles
- `GET /api/articles` - List articles with pagination and filters
- `GET /api/articles/:id` - Get article by ID
- `GET /api/articles/search` - Search articles
- `GET /api/articles/stats` - Get article statistics
- `DELETE /api/articles/:id` - Delete article

### Sources
- `GET /api/sources` - List all sources
- `GET /api/sources/:id` - Get source by ID
- `PATCH /api/sources/:id` - Update source (enable/disable)
- `GET /api/sources/categories` - List categories
- `POST /api/sources/:id/test` - Test API connection

### Fetch Jobs
- `POST /api/fetch` - Create fetch job
- `GET /api/fetch` - List fetch jobs
- `GET /api/fetch/:id` - Get fetch job by ID
- `POST /api/fetch/:id/retry` - Retry failed job
- `DELETE /api/fetch/:id` - Delete fetch job

## 🧪 Features Demo

### Fetch News Articles
1. Go to Dashboard or Fetch Jobs page
2. Use the "Fetch News Articles" form
3. Enter keyword (e.g., "Bitcoin", "AI", "Stock Market")
4. Select news type and articles per source
5. Choose active news sources
6. Click "Start Fetching"
7. Monitor progress in real-time

### Search & Filter
1. Go to Articles page
2. Use search bar for full-text search
3. Apply filters by source, category, type
4. Sort by date, title, or creation time
5. Paginate through results

## 📊 Database Schema

The application uses a normalized MySQL schema with:
- `news_sources` - API source configuration
- `categories` - Article categorization
- `articles` - Fetched news articles
- `fetch_jobs` - Background job tracking
- `settings` - Application configuration

## 🔄 Background Processing

Fetch jobs run asynchronously in the background:
1. Job created with PENDING status
2. Status changes to RUNNING when processing starts
3. Articles are fetched from selected sources
4. Job completes with COMPLETED or FAILED status
5. Real-time updates via React Query

## 🎨 UI Components

Built with reusable components:
- **Layout** - Sidebar navigation
- **Cards** - Article and job cards
- **Forms** - Fetch job creation
- **Badges** - Status indicators  
- **Buttons** - Action buttons
- **Inputs** - Form controls

## 🚀 Production Deployment

### Backend
```bash
cd backend
pnpm build
pnpm start
```

### Frontend
```bash
cd frontend
pnpm build
# Serve the dist/ folder with your web server
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes  
4. Push to the branch
5. Create a Pull Request

---

Built with ❤️ using modern web technologies