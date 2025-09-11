import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon, 
  ClockIcon, 
  UserIcon,
  TagIcon,
  CalendarDaysIcon,
  ShareIcon,
  BookmarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TextToSpeech } from '@/components/TextToSpeech';
import { AdvancedTextToSpeech } from '@/components/AdvancedTextToSpeech';
import { useArticle, useDeleteArticle } from '@/hooks/useArticles';
import { formatRelativeDate, formatDate, getNewsTypeColor } from '@/utils/formatters';

export const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const articleId = parseInt(id || '0', 10);
  
  const { data: article, isLoading, error } = useArticle(articleId);
  const deleteArticleMutation = useDeleteArticle();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      deleteArticleMutation.mutate(articleId, {
        onSuccess: () => {
          navigate('/articles');
        }
      });
    }
  };

  const handleShare = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Article URL copied to clipboard!');
    }
  };

  const handleBookmark = () => {
    // This could be implemented to save bookmarks locally or to a backend
    alert('Bookmark feature coming soon!');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Article not found
              </h3>
              <p className="text-gray-500 mb-6">
                The article you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/articles">
                <Button>Back to Articles</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          to="/articles" 
          className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Articles
        </Link>
        
        <div className="flex items-center space-x-2">
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            className="flex items-center"
          >
            <ShareIcon className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleBookmark}
            className="flex items-center"
          >
            <BookmarkIcon className="w-4 h-4 mr-2" />
            Bookmark
          </Button>
          
          <Button
            size="sm"
            variant="danger"
            onClick={handleDelete}
            loading={deleteArticleMutation.isPending}
            className="flex items-center"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Article Header */}
      <Card>
        <CardBody>
          <div className="space-y-4">
            {/* Article Title */}
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {article.title}
            </h1>

            {/* Article Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Badge variant={getNewsTypeColor(article.newsType)} size="lg">
                {article.newsType}
              </Badge>
              
              <div className="flex items-center text-primary-600 font-medium">
                <span>{article.source.name}</span>
              </div>

              {article.publishedAt && (
                <div className="flex items-center text-gray-600">
                  <CalendarDaysIcon className="w-4 h-4 mr-1" />
                  <span>{formatDate(article.publishedAt)}</span>
                  <span className="ml-2 text-gray-400">
                    ({formatRelativeDate(article.publishedAt)})
                  </span>
                </div>
              )}

              {article.author && (
                <div className="flex items-center text-gray-600">
                  <UserIcon className="w-4 h-4 mr-1" />
                  <span>{article.author}</span>
                </div>
              )}
            </div>

            {/* Article Description */}
            {article.description && (
              <p className="text-lg text-gray-700 leading-relaxed border-l-4 border-primary-200 pl-4 bg-gray-50 p-4 rounded-r-lg">
                {article.description}
              </p>
            )}

            {/* Keyword */}
            {article.keyword && (
              <div className="flex items-center">
                <TagIcon className="w-4 h-4 mr-2 text-gray-400" />
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                  {article.keyword}
                </span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Article Image */}
      {article.imageUrl && (
        <Card>
          <CardBody>
            <img
              className="w-full h-64 md:h-96 object-cover rounded-lg"
              src={article.imageUrl}
              alt={article.title}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.closest('.p-6')?.classList.add('hidden');
              }}
            />
          </CardBody>
        </Card>
      )}

      {/* Article Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Article Content</h2>
          </div>
        </CardHeader>
        <CardBody>
          {article.content ? (
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed space-y-4"
                style={{ whiteSpace: 'pre-line' }}
              >
                {article.content}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Full article content is not available. 
              </p>
              <p className="text-sm text-gray-400 mb-6">
                You can read the full article on the original source.
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Article Actions */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span>Added {formatRelativeDate(article.createdAt)}</span>
              </div>
              
              {article.updatedAt !== article.createdAt && (
                <div className="flex items-center">
                  <span>Updated {formatRelativeDate(article.updatedAt)}</span>
                </div>
              )}

              {article.isEnhanced && (
                <Badge variant="success" size="sm">
                  ✨ Enhanced
                </Badge>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => window.open(article.url, '_blank')}
                className="flex items-center"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
                Read Original Article
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Advanced Text-to-Speech Player */}
      <AdvancedTextToSpeech 
        article={article}
        showQueue={true}
        showProgress={true}
        compact={false}
        className="sticky bottom-4"
      />

      {/* Related Articles Section - Could be implemented later */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Related Articles</h3>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            <p>Related articles feature coming soon!</p>
            <p className="text-sm mt-2">
              We'll show articles with similar keywords or from the same source.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};