import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayCircleIcon, 
  ClockIcon,
  FunnelIcon,
  SparklesIcon,
  NewspaperIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';
import { NewsFetchForm } from '@/components/NewsFetchForm';
import { FetchJobCard } from '@/components/FetchJobCard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  useFetchJobs, 
  useCreateFetchJob, 
  useRetryFetchJob, 
  useDeleteFetchJob 
} from '@/hooks/useFetch';
import { FetchStatus } from '@/types';
import { formatNumber } from '@/utils/formatters';

export const FetchJobs: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { 
    data: jobsData, 
    isLoading, 
    error 
  } = useFetchJobs({ 
    page: currentPage, 
    limit: 10, 
    status: statusFilter || undefined 
  });

  const createJobMutation = useCreateFetchJob();
  const retryJobMutation = useRetryFetchJob();
  const deleteJobMutation = useDeleteFetchJob();

  const jobs = jobsData?.data || [];
  const pagination = jobsData?.pagination;

  // Calculate stats
  const runningJobs = jobs.filter(job => job.status === FetchStatus.RUNNING);
  const completedJobs = jobs.filter(job => job.status === FetchStatus.COMPLETED);
  const failedJobs = jobs.filter(job => job.status === FetchStatus.FAILED);

  const handleCreateJob = (data: any) => {
    createJobMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateForm(false);
      }
    });
  };

  const handleRetryJob = (id: number) => {
    retryJobMutation.mutate(id);
  };

  const handleDeleteJob = (id: number) => {
    deleteJobMutation.mutate(id);
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: FetchStatus.PENDING, label: 'Pending' },
    { value: FetchStatus.RUNNING, label: 'Running' },
    { value: FetchStatus.COMPLETED, label: 'Completed' },
    { value: FetchStatus.FAILED, label: 'Failed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <SparklesIcon className="w-8 h-8 mr-3 text-primary-600" />
          Fetch News
        </h1>
        <p className="text-gray-600 mt-1">
          Create and monitor news fetching processes from multiple sources. Each fetch searches for recent articles and adds them to your database.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Running</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(runningJobs.length)}
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
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(completedJobs.length)}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-red-600"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(failedJobs.length)}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center">
            <div className="flex-shrink-0">
              <PlayCircleIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Fetches</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(pagination?.total || 0)}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Create Job Form */}
      {showCreateForm ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create New Fetch</h2>
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </Button>
          </div>
          <NewsFetchForm
            onSubmit={handleCreateJob}
            loading={createJobMutation.isPending}
          />
        </div>
      ) : (
        <div className="flex justify-center">
          <Button
            onClick={() => setShowCreateForm(true)}
            size="lg"
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create New Fetch
          </Button>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <FunnelIcon className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Fetches</h3>
          </div>
        </CardHeader>
        
        <CardBody>
          <div className="space-y-4">
            {/* Status Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              {statusOptions.map((option) => {
                const isActive = statusFilter === option.value;
                const getStatusColor = () => {
                  switch (option.value) {
                    case FetchStatus.PENDING:
                      return isActive 
                        ? 'bg-blue-100 text-blue-800 border-blue-300 ring-2 ring-blue-200' 
                        : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100';
                    case FetchStatus.RUNNING:
                      return isActive 
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300 ring-2 ring-yellow-200' 
                        : 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100';
                    case FetchStatus.COMPLETED:
                      return isActive 
                        ? 'bg-green-100 text-green-800 border-green-300 ring-2 ring-green-200' 
                        : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100';
                    case FetchStatus.FAILED:
                      return isActive 
                        ? 'bg-red-100 text-red-800 border-red-300 ring-2 ring-red-200' 
                        : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100';
                    default:
                      return isActive 
                        ? 'bg-gray-100 text-gray-800 border-gray-300 ring-2 ring-gray-200' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50';
                  }
                };
                
                const getStatusIcon = () => {
                  switch (option.value) {
                    case FetchStatus.PENDING:
                      return <div className="w-2 h-2 bg-blue-400 rounded-full"></div>;
                    case FetchStatus.RUNNING:
                      return <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>;
                    case FetchStatus.COMPLETED:
                      return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
                    case FetchStatus.FAILED:
                      return <div className="w-2 h-2 bg-red-400 rounded-full"></div>;
                    default:
                      return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
                  }
                };

                return (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(isActive ? '' : option.value)}
                    className={`
                      inline-flex items-center px-4 py-2 rounded-lg border font-medium text-sm
                      transition-all duration-200 transform hover:scale-105 cursor-pointer
                      ${getStatusColor()}
                    `}
                  >
                    {option.value && getStatusIcon()}
                    <span className={option.value ? "ml-2" : ""}>{option.label}</span>
                    {isActive && (
                      <span className="ml-2 text-xs opacity-75">✕</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Filter Display */}
            {statusFilter && (() => {
              const getActiveFilterStyle = () => {
                switch (statusFilter) {
                  case FetchStatus.PENDING:
                    return {
                      bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
                      border: 'border-blue-200',
                      text: 'text-blue-800',
                      button: 'text-blue-600 hover:text-blue-800',
                      dot: 'bg-blue-500'
                    };
                  case FetchStatus.RUNNING:
                    return {
                      bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
                      border: 'border-yellow-200',
                      text: 'text-yellow-800',
                      button: 'text-yellow-600 hover:text-yellow-800',
                      dot: 'bg-yellow-500 animate-pulse'
                    };
                  case FetchStatus.COMPLETED:
                    return {
                      bg: 'bg-gradient-to-r from-green-50 to-green-100',
                      border: 'border-green-200',
                      text: 'text-green-800',
                      button: 'text-green-600 hover:text-green-800',
                      dot: 'bg-green-500'
                    };
                  case FetchStatus.FAILED:
                    return {
                      bg: 'bg-gradient-to-r from-red-50 to-red-100',
                      border: 'border-red-200',
                      text: 'text-red-800',
                      button: 'text-red-600 hover:text-red-800',
                      dot: 'bg-red-500'
                    };
                  default:
                    return {
                      bg: 'bg-gradient-to-r from-gray-50 to-gray-100',
                      border: 'border-gray-200',
                      text: 'text-gray-800',
                      button: 'text-gray-600 hover:text-gray-800',
                      dot: 'bg-gray-500'
                    };
                }
              };
              
              const style = getActiveFilterStyle();
              
              return (
                <div className={`flex items-center justify-between ${style.bg} rounded-lg p-3 border ${style.border}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 ${style.dot} rounded-full`}></div>
                    <span className={`${style.text} font-medium text-sm`}>
                      Showing {statusOptions.find(opt => opt.value === statusFilter)?.label} fetches
                    </span>
                  </div>
                  <button
                    onClick={() => setStatusFilter('')}
                    className={`${style.button} text-sm font-medium`}
                  >
                    Clear Filter
                  </button>
                </div>
              );
            })()}
          </div>
        </CardBody>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardBody>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardBody>
              <div className="text-center py-8">
                <p className="text-red-600">Error loading fetch jobs: {error.message}</p>
                <Button
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : jobs.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <SparklesIcon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {statusFilter 
                    ? `No ${statusOptions.find(opt => opt.value === statusFilter)?.label.toLowerCase()} fetches found`
                    : 'Ready to fetch some news?'
                  }
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {statusFilter 
                    ? `No fetches with status "${statusOptions.find(opt => opt.value === statusFilter)?.label}" found. Try clearing the filter or create a new fetch.`
                    : 'Create your first news fetch to start gathering fresh articles from news APIs. Each fetch searches for specific keywords and adds the latest articles to your database.'
                  }
                </p>
                {!showCreateForm && !statusFilter && (
                  <div className="space-y-4">
                    <Button
                      size="lg"
                      onClick={() => setShowCreateForm(true)}
                      className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Create Your First Fetch
                    </Button>
                    <div className="text-sm text-gray-500">
                      Or check your <Link to="/articles" className="text-primary-600 hover:underline font-medium">existing articles</Link>
                    </div>
                  </div>
                )}
                {statusFilter && (
                  <Button
                    variant="outline"
                    onClick={() => setStatusFilter('')}
                    className="mt-4"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <FetchJobCard
                key={job.id}
                job={job}
                onRetry={handleRetryJob}
                onDelete={handleDeleteJob}
                isRetrying={retryJobMutation.isPending}
                isDeleting={deleteJobMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <span className="text-sm text-gray-500">
                  ({formatNumber(pagination.total)} total fetches)
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!pagination.hasPrev}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) }, 
                    (_, i) => {
                      const pageNum = Math.max(1, pagination.page - 2) + i;
                      if (pageNum > pagination.totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={pageNum === pagination.page ? "primary" : "outline"}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!pagination.hasNext}
                  onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Help & Tips */}
      {!showCreateForm && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">How News Fetching Works</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Fetch Lifecycle:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <strong className='mr-1'>Pending:</strong> Fetch is queued and waiting to start
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <strong className='mr-1'>Running:</strong> Actively fetching articles from news APIs
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <strong className='mr-1'>Completed:</strong> Successfully gathered all articles
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <strong className='mr-1'>Failed:</strong> Encountered an error during processing
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Tips for better results:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Use specific keywords like "renewable energy" instead of just "energy"
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Choose "Financial" type for market, stock, or economic topics
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Start with fewer articles per source to avoid API limits
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Fetches only collect articles from the last 30 days for freshness
                  </li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};