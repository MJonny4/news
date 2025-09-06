import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  DocumentMagnifyingGlassIcon,
  ClockIcon,
  NewspaperIcon 
} from '@heroicons/react/24/outline';
import { ArticleCard } from '@/components/ArticleCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSearchArticles, useDeleteArticle } from '@/hooks/useArticles';
import { formatNumber } from '@/utils/formatters';
import { debounce } from 'lodash';

export const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { 
    data: searchResults = [], 
    isLoading, 
    error 
  } = useSearchArticles(debouncedQuery);

  const deleteArticleMutation = useDeleteArticle();

  // Debounced search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedQuery(query);
    }, 500),
    []
  );

  // Update debounced query when search input changes
  React.useEffect(() => {
    if (searchQuery.length >= 2) {
      debouncedSearch(searchQuery);
    } else {
      setDebouncedQuery('');
    }
  }, [searchQuery, debouncedSearch]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      setDebouncedQuery(searchQuery.trim());
    }
  };

  // Handle delete article
  const handleDeleteArticle = (id: number) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      deleteArticleMutation.mutate(id);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  // Group results by source for better organization
  const resultsBySource = useMemo(() => {
    const grouped: Record<string, typeof searchResults> = {};
    searchResults.forEach(article => {
      const sourceName = article.source.name;
      if (!grouped[sourceName]) {
        grouped[sourceName] = [];
      }
      grouped[sourceName].push(article);
    });
    return grouped;
  }, [searchResults]);

  const hasResults = searchResults.length > 0;
  const isSearching = debouncedQuery.length >= 2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <DocumentMagnifyingGlassIcon className="w-8 h-8 mr-3 text-primary-600" />
          Search Articles
        </h1>
        <p className="text-gray-600 mt-1">
          Find articles across all your news sources using full-text search.
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardBody>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search by title, description, content, author, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 text-base py-3"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={searchQuery.length < 2}
                className="px-8"
              >
                Search
              </Button>
              
              {(searchQuery || debouncedQuery) && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={clearSearch}
                >
                  Clear
                </Button>
              )}
            </div>
            
            <div className="text-sm text-gray-500">
              <p>
                💡 <strong>Search tips:</strong> Use specific terms for better results. 
                Search covers article titles, descriptions, content, authors, and keywords.
              </p>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Search Status & Results */}
      {isSearching && (
        <>
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
                  <span className="text-gray-600">Searching...</span>
                </div>
              ) : (
                <span className="text-gray-700">
                  {hasResults ? (
                    <>
                      Found <strong>{formatNumber(searchResults.length)}</strong> article{searchResults.length !== 1 ? 's' : ''} 
                      for "<strong>{debouncedQuery}</strong>"
                    </>
                  ) : (
                    <>No results found for "<strong>{debouncedQuery}</strong>"</>
                  )}
                </span>
              )}
            </div>
            
            {hasResults && (
              <div className="flex items-center space-x-2">
                <Badge variant="primary" size="sm">
                  {Object.keys(resultsBySource).length} source{Object.keys(resultsBySource).length !== 1 ? 's' : ''}
                </Badge>
              </div>
            )}
          </div>

          {/* Search Results */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardBody>
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                      <div className="h-20 bg-gray-200 rounded mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardBody>
                <div className="text-center py-8">
                  <p className="text-red-600">Error searching articles: {error.message}</p>
                  <Button
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : hasResults ? (
            <div className="space-y-8">
              {/* Group results by source */}
              {Object.entries(resultsBySource).map(([sourceName, articles]) => (
                <div key={sourceName} className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{sourceName}</h3>
                    <Badge variant="gray" size="sm">
                      {articles.length} result{articles.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        onDelete={handleDeleteArticle}
                        isDeleting={deleteArticleMutation.isPending}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardBody>
                <div className="text-center py-12">
                  <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No articles found
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Try different keywords or check if you have articles that match your search.
                  </p>
                  <div className="mt-6">
                    <Link to="/articles">
                      <Button variant="outline">
                        <NewspaperIcon className="w-4 h-4 mr-2" />
                        Browse All Articles
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}

      {/* Welcome State - No search yet */}
      {!isSearching && (
        <Card>
          <CardBody>
            <div className="text-center py-16">
              <DocumentMagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-6 text-xl font-medium text-gray-900">
                Start searching your articles
              </h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                Enter at least 2 characters in the search box above to find articles 
                across all your news sources.
              </p>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <MagnifyingGlassIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Full-Text Search</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Search titles, descriptions, content, and authors
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <ClockIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Real-time Results</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Get instant results as you type
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <NewspaperIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Multi-Source</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Search across all your news sources
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};