import React from 'react';
import { useForm } from 'react-hook-form';
import { PlayCircleIcon } from '@heroicons/react/24/outline';
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
    { value: 1, label: '1 article' },
    { value: 3, label: '3 articles' },
    { value: 5, label: '5 articles' },
    { value: 10, label: '10 articles' },
    { value: 15, label: '15 articles' },
    { value: 20, label: '20 articles' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <PlayCircleIcon className="w-6 h-6 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Fetch News Articles</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Configure and start a new article fetching job from your selected news sources.
        </p>
      </CardHeader>
      
      <CardBody>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Search Keyword"
              placeholder="e.g., Bitcoin, AI, Stock Market"
              error={errors.keyword?.message}
              {...register('keyword', { 
                required: 'Keyword is required',
                minLength: { value: 2, message: 'Keyword must be at least 2 characters' }
              })}
            />
            
            <Select
              label="News Type"
              options={newsTypeOptions}
              error={errors.newsType?.message}
              {...register('newsType', { required: 'News type is required' })}
            />
            
            <Select
              label="Articles per Source"
              options={articlesPerSourceOptions}
              error={errors.articlesPerSource?.message}
              {...register('articlesPerSource', { 
                required: 'Articles per source is required',
                valueAsNumber: true 
              })}
            />
          </div>

          {/* Source Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                News Sources {selectedSources?.length > 0 && `(${selectedSources.length} selected)`}
              </label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={selectAllSources}
                  disabled={!sources?.length}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={clearAllSources}
                  disabled={!selectedSources?.length}
                >
                  Clear All
                </Button>
              </div>
            </div>
            
            {sources && sources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSources?.includes(source.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!source.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => source.isActive && toggleSource(source.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSources?.includes(source.id) || false}
                      onChange={() => source.isActive && toggleSource(source.id)}
                      disabled={!source.isActive}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1 min-w-0">
                      <label className="text-sm font-medium text-gray-900 cursor-pointer">
                        {source.name}
                      </label>
                      <p className="text-xs text-gray-500">
                        {source.articleCount || 0} articles • {source.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No news sources available</p>
              </div>
            )}
            
            {errors.sourceIds && (
              <p className="mt-2 text-sm text-red-600">
                Please select at least one source
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={loading}
              disabled={!selectedSources?.length}
              className="min-w-32"
            >
              <PlayCircleIcon className="w-4 h-4 mr-2" />
              Start Fetching
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};