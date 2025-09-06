import React, { useState } from 'react';
import { 
  PlayCircleIcon, 
  ClockIcon,
  FunnelIcon 
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fetch Jobs</h1>
          <p className="text-gray-600 mt-1">
            Create and monitor news article fetching jobs from multiple sources.
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center"
        >
          <PlayCircleIcon className="w-5 h-5 mr-2" />
          New Fetch Job
        </Button>
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
              <p className="text-sm font-medium text-gray-500">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(pagination?.total || 0)}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Create Job Form */}
      {showCreateForm && (
        <div className="space-y-4">
          <NewsFetchForm
            onSubmit={handleCreateJob}
            loading={createJobMutation.isPending}
          />
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FunnelIcon className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Filter Jobs</h3>
            </div>
            
            {statusFilter && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStatusFilter('')}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardBody>
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-xs">
              <Select
                label="Status"
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              {statusFilter && (
                <Badge variant="primary" size="sm">
                  Filtered by: {statusOptions.find(opt => opt.value === statusFilter)?.label}
                </Badge>
              )}
            </div>
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
                <PlayCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No fetch jobs yet
                </h3>
                <p className="mt-2 text-gray-500">
                  {statusFilter 
                    ? `No jobs with status "${statusOptions.find(opt => opt.value === statusFilter)?.label}"` 
                    : 'Create your first fetch job to start gathering news articles.'
                  }
                </p>
                {!showCreateForm && (
                  <Button
                    className="mt-6"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <PlayCircleIcon className="w-5 h-5 mr-2" />
                    Create First Job
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
                  ({formatNumber(pagination.total)} total jobs)
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
    </div>
  );
};