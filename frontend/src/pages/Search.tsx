import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSources } from '@/hooks/useSources';
import { useCreateFetchJob } from '@/hooks/useFetchJobs';
import { NewsType } from '@/types';

export const Search: React.FC = () => {
  const [searchForm, setSearchForm] = useState({
    keyword: '',
    newsType: NewsType.GENERAL,
    articlesPerSource: 10,
    sourceIds: [] as number[]
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const { data: sources = [] } = useSources();
  const createFetchJobMutation = useCreateFetchJob();

  const activeSources = sources.filter(source => source.isActive);

  // Handle search form changes
  const updateForm = (updates: Partial<typeof searchForm>) => {
    setSearchForm(prev => ({ ...prev, ...updates }));
  };

  // Handle search submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchForm.keyword.trim()) {
      return;
    }

    const selectedSources = searchForm.sourceIds.length > 0 
      ? searchForm.sourceIds 
      : activeSources.map(s => s.id);

    if (selectedSources.length === 0) {
      alert('Please activate at least one news source or select specific sources.');
      return;
    }

    try {
      await createFetchJobMutation.mutateAsync({
        keyword: searchForm.keyword.trim(),
        newsType: searchForm.newsType,
        articlesPerSource: searchForm.articlesPerSource,
        sourceIds: selectedSources
      });

      // Add to search history
      const keyword = searchForm.keyword.trim();
      if (!searchHistory.includes(keyword)) {
        setSearchHistory(prev => [keyword, ...prev].slice(0, 10));
      }

      // Reset form
      setSearchForm({
        keyword: '',
        newsType: NewsType.GENERAL,
        articlesPerSource: 10,
        sourceIds: []
      });

    } catch (error) {
      console.error('Failed to create search job:', error);
    }
  };

  // Quick search suggestions
  const quickSearchTerms = [
    'artificial intelligence',
    'cryptocurrency', 
    'climate change',
    'technology',
    'business',
    'healthcare',
    'finance',
    'science'
  ];

  const newsTypeOptions = [
    { value: NewsType.GENERAL, label: 'General News' },
    { value: NewsType.FINANCIAL, label: 'Financial News' },
    { value: NewsType.KEYWORD, label: 'Keyword-based' }
  ];

  const articleCountOptions = [
    { value: 5, label: '5 articles per source' },
    { value: 10, label: '10 articles per source' },
    { value: 15, label: '15 articles per source' },
    { value: 20, label: '20 articles per source' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <SparklesIcon className="w-8 h-8 mr-3 text-primary-600" />
          Search New Articles
        </h1>
        <p className="text-gray-600 mt-1">
          Search and fetch fresh articles from news APIs using keywords and topics. To search existing articles, check the <Link to="/articles" className="text-primary-600 hover:underline font-medium">Articles page</Link>.
        </p>
      </div>

      {/* API Limits Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardBody>
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <h3 className="font-medium text-amber-800 mb-1">API Rate Limits Apply</h3>
              <p className="text-amber-700">
                This feature fetches new articles from external APIs. To avoid hitting rate limits, 
                search is only triggered when you click the "Search & Fetch" button below.
                Each search creates a fetch job that will gather articles in the background.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Search Form */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Discover New Articles</h2>
            <p className="text-gray-600 text-sm">Search across multiple news sources to find and fetch the latest articles</p>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Main Search Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
              
              <Input
                placeholder="Enter keywords or topics to search for (e.g., 'artificial intelligence', 'climate change')..."
                value={searchForm.keyword}
                onChange={(e) => updateForm({ keyword: e.target.value })}
                className="pl-14 pr-4 py-4 text-lg rounded-xl border-gray-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                required
              />
            </div>

            {/* Search Options */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* News Type Selection */}
              <div className="group">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <h3 className="text-sm font-semibold text-gray-800">News Type</h3>
                  </div>
                  <Select
                    options={newsTypeOptions}
                    value={searchForm.newsType}
                    onChange={(e) => updateForm({ newsType: e.target.value as NewsType })}
                    className="bg-white border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 rounded-lg shadow-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">Choose the type of news content to search for</p>
                </div>
              </div>
              
              {/* Articles Count Selection */}
              <div className="group">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    <h3 className="text-sm font-semibold text-gray-800">Article Count</h3>
                  </div>
                  <Select
                    options={articleCountOptions}
                    value={searchForm.articlesPerSource}
                    onChange={(e) => updateForm({ articlesPerSource: Number(e.target.value) })}
                    className="bg-white border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 rounded-lg shadow-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">Number of articles to fetch from each source</p>
                </div>
              </div>

              {/* Sources Selection */}
              <div className="group">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      News Sources 
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary-100 text-primary-700 ml-2">
                        {activeSources.length} active
                      </span>
                    </h3>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-3 max-h-32 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2.5">
                      <label className="flex items-center group/checkbox cursor-pointer">
                        <input
                          type="checkbox"
                          checked={searchForm.sourceIds.length === 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateForm({ sourceIds: [] });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 transition-colors"
                        />
                        <span className="ml-3 text-sm text-gray-800 font-medium group-hover/checkbox:text-primary-700 transition-colors">
                          All active sources
                        </span>
                      </label>
                      {activeSources.map((source) => (
                        <label key={source.id} className="flex items-center group/checkbox cursor-pointer">
                          <input
                            type="checkbox"
                            checked={searchForm.sourceIds.includes(source.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateForm({ 
                                  sourceIds: [...searchForm.sourceIds, source.id] 
                                });
                              } else {
                                updateForm({ 
                                  sourceIds: searchForm.sourceIds.filter(id => id !== source.id) 
                                });
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 transition-colors"
                          />
                          <span className="ml-3 text-sm text-gray-700 group-hover/checkbox:text-primary-700 transition-colors">{source.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Select specific sources or use all active ones</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                loading={createFetchJobMutation.isPending}
                disabled={!searchForm.keyword.trim() || activeSources.length === 0}
                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                {createFetchJobMutation.isPending ? 'Creating Fetch Job...' : 'Search & Fetch Articles'}
              </Button>
            </div>

            {/* Quick Search Suggestions */}
            <div className="flex flex-wrap items-center gap-2 justify-center text-sm">
              <span className="text-gray-500 font-medium">Quick searches:</span>
              {quickSearchTerms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => updateForm({ keyword: term })}
                  className="px-3 py-1 rounded-full bg-white/60 hover:bg-white text-gray-600 hover:text-primary-700 border border-gray-200 hover:border-primary-300 transition-all duration-150 capitalize"
                >
                  {term}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              Recent Searches
            </h3>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((term, index) => (
                <button
                  key={index}
                  onClick={() => updateForm({ keyword: term })}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-colors"
                >
                  {term}
                </button>
              ))}
              <button
                onClick={() => setSearchHistory([])}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear history
              </button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Help & Tips */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Search Tips & Information</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">How it works:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Enter keywords or topics you want to search for
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Choose the type of news and number of articles
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Select which sources to search or use all active sources
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  A fetch job will be created to gather the articles
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tips for better results:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Use specific keywords like "renewable energy" instead of just "energy"
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Combine related terms: "artificial intelligence healthcare"
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Use financial news type for market, stock, or economic topics
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Check <Link to="/fetch" className="text-primary-600 hover:underline">fetch jobs</Link> to monitor search progress
                </li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Active Sources Status */}
      {activeSources.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardBody>
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <NewspaperIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">
                No Active News Sources
              </h3>
              <p className="text-yellow-700 mb-4">
                You need to activate at least one news source before you can search for new articles.
              </p>
              <Link to="/settings">
                <Button variant="primary">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Configure Sources
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};