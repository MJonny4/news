import axios, { AxiosResponse } from 'axios';
import { prisma } from '@/config/database';
import { NewsAPIArticle, GuardianArticle, AlphaVantageArticle, NewsType } from '@/types';
import { AppError } from '@/middleware/errorHandler';

export class NewsService {
  private static readonly API_CONFIGS = {
    newsapi: {
      baseUrl: 'https://newsapi.org/v2',
      keyName: 'NEWSAPIORG',
    },
    guardian: {
      baseUrl: 'https://content.guardianapis.com',
      keyName: 'THEGUARDIANOPENPLATFORM',
    },
    alphavantage: {
      baseUrl: 'https://www.alphavantage.co/query',
      keyName: 'ALPHAVANTAGE',
    },
  };

  async fetchArticles(
    sourceIds: number[],
    keyword: string,
    newsType: NewsType,
    articlesPerSource: number
  ): Promise<{ success: boolean; articlesAdded: number; errors: string[] }> {
    const errors: string[] = [];
    let totalArticlesAdded = 0;

    const sources = await prisma.newsSource.findMany({
      where: {
        id: { in: sourceIds },
        isActive: true,
      },
    });

    for (const source of sources) {
      try {
        let articles: any[] = [];

        switch (source.name.toLowerCase()) {
          case 'newsapi':
            articles = await this.fetchFromNewsAPI(keyword, newsType, articlesPerSource);
            break;
          case 'guardian':
            articles = await this.fetchFromGuardian(keyword, newsType, articlesPerSource);
            break;
          case 'alpha vantage':
            articles = await this.fetchFromAlphaVantage(keyword, newsType, articlesPerSource);
            break;
          default:
            errors.push(`Unknown source: ${source.name}`);
            continue;
        }

        const savedCount = await this.saveArticles(articles, source.id, keyword, newsType);
        totalArticlesAdded += savedCount;
        
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
        errors.push(`${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      articlesAdded: totalArticlesAdded,
      errors,
    };
  }

  private async fetchFromNewsAPI(
    keyword: string,
    newsType: NewsType,
    pageSize: number
  ): Promise<NewsAPIArticle[]> {
    const apiKey = process.env.NEWSAPIORG;
    if (!apiKey) throw new AppError('NewsAPI key not configured', 500);

    const endpoint = newsType === NewsType.FINANCIAL ? 'everything' : 'top-headlines';
    const params: any = {
      apiKey,
      pageSize,
      language: 'en',
    };

    if (newsType === NewsType.FINANCIAL) {
      params.q = `${keyword} AND (finance OR financial OR economy OR market OR business)`;
      params.sortBy = 'publishedAt';
    } else {
      params.q = keyword;
      params.category = newsType === NewsType.GENERAL ? 'general' : undefined;
    }

    const response: AxiosResponse = await axios.get(
      `${NewsService.API_CONFIGS.newsapi.baseUrl}/${endpoint}`,
      { params }
    );

    if (response.data.status !== 'ok') {
      throw new AppError(`NewsAPI error: ${response.data.message}`, 400);
    }

    return response.data.articles || [];
  }

  private async fetchFromGuardian(
    keyword: string,
    newsType: NewsType,
    pageSize: number
  ): Promise<GuardianArticle[]> {
    const apiKey = process.env.THEGUARDIANOPENPLATFORM;
    if (!apiKey) throw new AppError('Guardian API key not configured', 500);

    const params: any = {
      'api-key': apiKey,
      q: keyword,
      'page-size': pageSize,
      'show-fields': 'headline,bodyText,thumbnail,byline',
      'order-by': 'newest',
    };

    if (newsType === NewsType.FINANCIAL) {
      params.section = 'business';
    }

    const response: AxiosResponse = await axios.get(
      `${NewsService.API_CONFIGS.guardian.baseUrl}/search`,
      { params }
    );

    if (response.data.response.status !== 'ok') {
      throw new AppError(`Guardian API error: ${response.data.response.message}`, 400);
    }

    return response.data.response.results || [];
  }

  private async fetchFromAlphaVantage(
    keyword: string,
    newsType: NewsType,
    limit: number
  ): Promise<AlphaVantageArticle[]> {
    const apiKey = process.env.ALPHAVANTAGE;
    if (!apiKey) throw new AppError('Alpha Vantage API key not configured', 500);

    const params = {
      function: 'NEWS_SENTIMENT',
      tickers: '',
      topics: newsType === NewsType.FINANCIAL ? 'financial_markets' : '',
      apikey: apiKey,
      limit: limit.toString(),
    };

    // Add keyword to topics or tickers based on context
    if (newsType === NewsType.FINANCIAL && this.isStockSymbol(keyword)) {
      params.tickers = keyword.toUpperCase();
    } else {
      params.topics = keyword;
    }

    const response: AxiosResponse = await axios.get(
      NewsService.API_CONFIGS.alphavantage.baseUrl,
      { params }
    );

    if (response.data.Information) {
      throw new AppError(`Alpha Vantage API error: ${response.data.Information}`, 400);
    }

    return response.data.feed || [];
  }

  private async saveArticles(
    articles: any[],
    sourceId: number,
    keyword: string,
    newsType: NewsType
  ): Promise<number> {
    let savedCount = 0;

    for (const article of articles) {
      try {
        const normalizedArticle = this.normalizeArticle(article, sourceId, keyword, newsType);
        
        await prisma.article.upsert({
          where: {
            unique_article: {
              externalId: normalizedArticle.externalId || '',
              sourceId: sourceId,
            },
          },
          update: {
            title: normalizedArticle.title,
            description: normalizedArticle.description,
            content: normalizedArticle.content,
            publishedAt: normalizedArticle.publishedAt,
            author: normalizedArticle.author,
            imageUrl: normalizedArticle.imageUrl,
            updatedAt: new Date(),
          },
          create: normalizedArticle,
        });
        
        savedCount++;
      } catch (error) {
        console.error('Error saving article:', error);
      }
    }

    return savedCount;
  }

  private normalizeArticle(article: any, sourceId: number, keyword: string, newsType: NewsType) {
    let normalized: any = {
      sourceId,
      keyword,
      newsType,
    };

    if (this.isNewsAPIArticle(article)) {
      normalized = {
        ...normalized,
        externalId: this.generateId(article.url),
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: new Date(article.publishedAt),
        author: article.author,
        imageUrl: article.urlToImage,
      };
    } else if (this.isGuardianArticle(article)) {
      normalized = {
        ...normalized,
        externalId: article.id,
        title: article.webTitle,
        description: article.fields?.bodyText?.substring(0, 500),
        content: article.fields?.bodyText,
        url: article.webUrl,
        publishedAt: new Date(article.webPublicationDate),
        author: article.fields?.byline,
        imageUrl: article.fields?.thumbnail,
      };
    } else if (this.isAlphaVantageArticle(article)) {
      normalized = {
        ...normalized,
        externalId: this.generateId(article.url),
        title: article.title,
        description: article.summary,
        url: article.url,
        publishedAt: new Date(article.time_published),
        author: article.authors?.join(', '),
        imageUrl: article.banner_image,
      };
    }

    return normalized;
  }

  private isNewsAPIArticle(article: any): article is NewsAPIArticle {
    return article.source && article.publishedAt && article.url;
  }

  private isGuardianArticle(article: any): article is GuardianArticle {
    return article.webTitle && article.webUrl && article.webPublicationDate;
  }

  private isAlphaVantageArticle(article: any): article is AlphaVantageArticle {
    return article.title && article.url && article.time_published;
  }

  private isStockSymbol(text: string): boolean {
    // Simple check for stock symbols (all caps, 1-5 characters)
    return /^[A-Z]{1,5}$/.test(text.toUpperCase());
  }

  private generateId(url: string): string {
    // Generate a simple hash from URL for external ID
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  async getSourceStats() {
    const sources = await prisma.newsSource.findMany({
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    return sources.map(source => ({
      id: source.id,
      name: source.name,
      apiKeyName: source.apiKeyName,
      baseUrl: source.baseUrl,
      isActive: source.isActive,
      articleCount: source._count.articles,
      createdAt: source.createdAt.toISOString(),
      updatedAt: source.updatedAt.toISOString(),
    }));
  }
}