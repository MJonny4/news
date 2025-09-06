import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowTopRightOnSquareIcon, 
  ClockIcon, 
  UserIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import { Article } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { formatRelativeDate, truncateText, getNewsTypeColor } from '@/utils/formatters';

interface ArticleCardProps {
  article: Article;
  showActions?: boolean;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  showActions = true, 
  onDelete,
  isDeleting = false 
}) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border hover:border-primary-200">
      <CardBody className="h-full flex flex-col">
        <div className="flex items-start justify-between flex-1">
          <div className="flex-1 min-w-0">
            {/* Article Title */}
            <Link 
              to={`/articles/${article.id}`}
              className="block group"
            >
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors leading-tight">
                {article.title}
              </h3>
            </Link>

            {/* Article Metadata */}
            <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500">
              <Badge variant={getNewsTypeColor(article.newsType)}>
                {article.newsType}
              </Badge>
              <span className="font-medium text-primary-600">
                {article.source.name}
              </span>
              {article.publishedAt && (
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {formatRelativeDate(article.publishedAt)}
                </div>
              )}
              {article.author && (
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-1" />
                  <span className="truncate max-w-32">{article.author}</span>
                </div>
              )}
            </div>

            {/* Article Description */}
            {article.description && (
              <p className="mt-3 text-gray-600 leading-relaxed">
                {truncateText(article.description, 200)}
              </p>
            )}

            {/* Keyword */}
            {article.keyword && (
              <div className="mt-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                  Keyword: {article.keyword}
                </span>
              </div>
            )}
          </div>

          {/* Article Image */}
          {article.imageUrl && (
            <div className="ml-4 flex-shrink-0">
              <img
                className="h-20 w-20 rounded-lg object-cover"
                src={article.imageUrl}
                alt={article.title}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Link to={`/articles/${article.id}`}>
                <Button
                  size="sm"
                  variant="primary"
                  className="text-xs"
                >
                  Read More
                </Button>
              </Link>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(article.url, '_blank')}
                className="text-xs"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-1" />
                Original
              </Button>
              
              {article.isEnhanced && (
                <Badge variant="success" size="sm">
                  Enhanced
                </Badge>
              )}
            </div>

            {onDelete && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => onDelete(article.id)}
                loading={isDeleting}
                className="text-xs"
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};