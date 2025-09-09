import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  PlayCircleIcon, 
  SparklesIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { CreateFetchJobRequest, NewsType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useSources } from '@/hooks/useSources';

interface NewsFetchFormProps {
  onSubmit: (data: CreateFetchJobRequest) => void;
  loading?: boolean;
}

export const NewsFetchForm: React.FC<NewsFetchFormProps> = ({ onSubmit, loading }) => {
  const { data: sources } = useSources();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    setError,
    clearErrors,
  } = useForm<CreateFetchJobRequest>({
    defaultValues: {
      keyword: '',
      newsType: NewsType.GENERAL,
      articlesPerSource: 5,
      sourceIds: [],
    },
  });

  const selectedSources = watch('sourceIds');

  // Handle source toggle
  const toggleSource = (sourceId: number) => {
    const current = selectedSources || [];
    const newSelection = current.includes(sourceId)
      ? current.filter(id => id !== sourceId)
      : [...current, sourceId];
    setValue('sourceIds', newSelection);
    
    // Clear errors when sources are selected
    if (newSelection.length > 0) {
      clearErrors('sourceIds');
    }
  };

  // Select all sources
  const selectAllSources = () => {
    const allActiveSourceIds = sources
      ?.filter(source => source.isActive)
      .map(source => source.id) || [];
    setValue('sourceIds', allActiveSourceIds);
    clearErrors('sourceIds');
  };

  // Clear all sources
  const clearAllSources = () => {
    setValue('sourceIds', []);
  };

  const handleFormSubmit = (data: CreateFetchJobRequest) => {
    // Validate that at least one source is selected
    if (!data.sourceIds || data.sourceIds.length === 0) {
      setError('sourceIds', { 
        type: 'required', 
        message: 'Please select at least one source' 
      });
      return;
    }
    
    // Add to search history
    const keyword = data.keyword.trim();
    if (keyword && !searchHistory.includes(keyword)) {
      setSearchHistory(prev => [keyword, ...prev].slice(0, 10));
    }
    
    clearErrors('sourceIds');
    onSubmit(data);
    reset();
  };

  const newsTypeOptions = [
    { value: NewsType.GENERAL, label: 'General News' },
    { value: NewsType.FINANCIAL, label: 'Financial News' },
    { value: NewsType.KEYWORD, label: 'Keyword-based' },
  ];

  const articlesPerSourceOptions = [
    { value: 5, label: '5 articles per source' },
    { value: 10, label: '10 articles per source' },
    { value: 15, label: '15 articles per source' },
    { value: 20, label: '20 articles per source' }
  ];

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

  const activeSources = sources?.filter(source => source.isActive) || [];

  return (
    <div className="space-y-6">
      {/* API Limits Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardBody>
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <h3 className="font-medium text-amber-800 mb-1">API Rate Limits Apply</h3>
              <p className="text-amber-700">
                This creates a news fetch that gathers articles from external APIs in the background.
                To avoid hitting rate limits, each search is processed as a separate fetch.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Enhanced Main Form */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 mr-2 text-primary-600" />
              Create New Fetch
            </h2>
            <p className="text-gray-600 text-sm">Search across multiple news sources to find and fetch the latest articles</p>
          </div>
          
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Main Search Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
              
              <Input
                placeholder="Enter keywords or topics to search for (e.g., 'artificial intelligence', 'climate change')..."
                className="pl-14 pr-4 py-4 text-lg rounded-xl border-gray-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                error={errors.keyword?.message}
                {...register('keyword', { 
                  required: 'Keyword is required',
                  minLength: { value: 2, message: 'Keyword must be at least 2 characters' }
                })}
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
                    className="bg-white border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 rounded-lg shadow-sm"
                    error={errors.newsType?.message}
                    {...register('newsType', { required: 'News type is required' })}
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
                    options={articlesPerSourceOptions}
                    className="bg-white border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 rounded-lg shadow-sm"
                    error={errors.articlesPerSource?.message}
                    {...register('articlesPerSource', { 
                      required: 'Articles per source is required',
                      valueAsNumber: true 
                    })}
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
                  
                  <div className="flex justify-between mb-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={selectAllSources}
                      disabled={!activeSources.length}
                      className="text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={clearAllSources}
                      disabled={!selectedSources?.length}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200 p-3 max-h-32 overflow-y-auto">
                    <div className="space-y-2.5">
                      <label className="flex items-center group/checkbox cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(selectedSources?.length || 0) === 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setValue('sourceIds', []);
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
                            checked={selectedSources?.includes(source.id) || false}
                            onChange={() => toggleSource(source.id)}
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 transition-colors"
                          />
                          <span className="ml-3 text-sm text-gray-700 group-hover/checkbox:text-primary-700 transition-colors">{source.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Select specific sources or use all active ones</p>
                  {errors.sourceIds && (
                    <p className="mt-2 text-xs text-red-600">
                      Please select at least one source
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                loading={loading}
                disabled={!selectedSources?.length || !activeSources.length}
                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                {loading ? 'Creating Fetch...' : 'Create & Start Fetch'}
              </Button>
            </div>

            {/* Quick Search Suggestions */}
            <div className="flex flex-wrap items-center gap-2 justify-center text-sm">
              <span className="text-gray-500 font-medium">Quick searches:</span>
              {quickSearchTerms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setValue('keyword', term)}
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
                  onClick={() => setValue('keyword', term)}
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
    </div>
  );
};