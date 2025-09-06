import React, { useState } from 'react';
import { 
  CogIcon, 
  GlobeAltIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  useSources, 
  useCategories, 
  useUpdateSource, 
  useTestSourceConnection 
} from '@/hooks/useSources';
import { formatNumber, formatRelativeDate } from '@/utils/formatters';

export const Settings: React.FC = () => {
  const { data: sources, isLoading: sourcesLoading } = useSources();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const updateSourceMutation = useUpdateSource();
  const testConnectionMutation = useTestSourceConnection();

  const [testingSource, setTestingSource] = useState<number | null>(null);

  // Handle source toggle
  const handleToggleSource = (sourceId: number, isActive: boolean) => {
    updateSourceMutation.mutate({ id: sourceId, data: { isActive: !isActive } });
  };

  // Handle test connection
  const handleTestConnection = async (sourceId: number) => {
    setTestingSource(sourceId);
    try {
      await testConnectionMutation.mutateAsync(sourceId);
    } finally {
      setTestingSource(null);
    }
  };

  // Calculate statistics
  const totalArticles = sources?.reduce((sum, source) => sum + (source.articleCount || 0), 0) || 0;
  const activeSources = sources?.filter(source => source.isActive).length || 0;
  const totalSources = sources?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <CogIcon className="w-8 h-8 mr-3 text-primary-600" />
          Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your news sources, categories, and application preferences.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="flex items-center">
            <div className="flex-shrink-0">
              <GlobeAltIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Sources</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeSources}/{totalSources}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-blue-600"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(totalArticles)}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-600"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories?.length || 0}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* News Sources Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">News Sources</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage your news API sources and test their connections.
              </p>
            </div>
            
            {sources && (
              <Badge variant="primary">
                {activeSources} of {totalSources} active
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {sourcesLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : sources && sources.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {sources.map((source, index) => (
                <div key={source.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          source.isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          {source.name.charAt(0)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {source.name}
                          </h3>
                          {source.isActive ? (
                            <Badge variant="success" size="sm">Active</Badge>
                          ) : (
                            <Badge variant="gray" size="sm">Inactive</Badge>
                          )}
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            <strong>{formatNumber(source.articleCount || 0)}</strong> articles
                          </span>
                          <span>•</span>
                          <span>API: {source.apiKeyName}</span>
                          <span>•</span>
                          <span title={source.baseUrl}>
                            {(() => {
                              try {
                                return new URL(source.baseUrl).hostname;
                              } catch {
                                return source.baseUrl;
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Test Connection Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestConnection(source.id)}
                        loading={testingSource === source.id}
                        disabled={!source.isActive || updateSourceMutation.isPending}
                        className="flex items-center"
                      >
                        <ArrowPathIcon className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                      
                      {/* Toggle Active/Inactive */}
                      <Button
                        size="sm"
                        variant={source.isActive ? "danger" : "primary"}
                        onClick={() => handleToggleSource(source.id, source.isActive)}
                        loading={updateSourceMutation.isPending}
                        className="flex items-center min-w-24"
                      >
                        {source.isActive ? (
                          <>
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            Disable
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Enable
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6">
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No sources configured
                </h3>
                <p className="mt-2 text-gray-500">
                  News sources should be automatically configured. Please check your setup.
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
            <p className="text-sm text-gray-600 mt-1">
              View available article categories and their usage statistics.
            </p>
          </div>
        </CardHeader>

        <CardBody>
          {categoriesLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                  </div>
                  <Badge variant="gray" size="sm">
                    {formatNumber(category.articleCount || 0)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories available</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* API Status Information */}
      <Card>
        <CardHeader>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">API Information</h2>
            <p className="text-sm text-gray-600 mt-1">
              Information about your configured news APIs and their status.
            </p>
          </div>
        </CardHeader>

        <CardBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">NewsAPI</h4>
                <p className="text-sm text-gray-600 mb-3">
                  General news articles from thousands of sources worldwide.
                </p>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-green-600">Configured</span>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Guardian API</h4>
                <p className="text-sm text-gray-600 mb-3">
                  High-quality journalism and news from The Guardian newspaper.
                </p>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-green-600">Configured</span>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Alpha Vantage</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Financial news and market data for investment research.
                </p>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-green-600">Configured</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CogIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-900">API Rate Limits</h4>
                  <div className="mt-1 text-sm text-blue-700">
                    <p>• NewsAPI: 1,000 requests/day</p>
                    <p>• Guardian: 5,000 requests/day</p>
                    <p>• Alpha Vantage: 500 requests/day</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};