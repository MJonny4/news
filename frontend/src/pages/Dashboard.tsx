import React from 'react';
import { 
  NewspaperIcon, 
  GlobeAltIcon, 
  ClockIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useArticleStats } from '@/hooks/useArticles';
import { useFetchJobs } from '@/hooks/useFetch';
import { formatNumber } from '@/utils/formatters';
import { FetchStatus } from '@/types';

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useArticleStats();
  const { data: fetchJobsData, isLoading: jobsLoading } = useFetchJobs({ limit: 5 });

  const recentJobs = fetchJobsData?.data || [];
  const runningJobs = recentJobs.filter(job => job.status === FetchStatus.RUNNING);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your financial news hub activity and statistics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Articles */}
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <NewspaperIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Articles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : formatNumber(stats?.total || 0)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* This Week */}
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : formatNumber(stats?.thisWeek || 0)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Active Sources */}
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GlobeAltIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Sources</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : stats?.bySource?.length || 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Running Jobs */}
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Running Jobs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobsLoading ? '...' : runningJobs.length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Articles by Source */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Articles by Source</h3>
          </CardHeader>
          <CardBody>
            {statsLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : stats?.bySource?.length ? (
              <div className="space-y-3">
                {stats.bySource.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {source.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatNumber(source.count)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No articles yet</p>
            )}
          </CardBody>
        </Card>

        {/* Articles by News Type */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Articles by Type</h3>
          </CardHeader>
          <CardBody>
            {statsLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : stats?.byNewsType?.length ? (
              <div className="space-y-3">
                {stats.byNewsType.map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Badge variant="primary" size="sm">
                      {type.type}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {formatNumber(type.count)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No articles yet</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent Fetch Jobs */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Recent Fetch Jobs</h3>
        </CardHeader>
        <CardBody>
          {jobsLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : recentJobs.length ? (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        &quot;{job.keyword}&quot;
                      </span>
                      <Badge variant="gray" size="sm">
                        {job.newsType}
                      </Badge>
                      <Badge variant={job.status === FetchStatus.COMPLETED ? 'success' : 
                                    job.status === FetchStatus.FAILED ? 'danger' :
                                    job.status === FetchStatus.RUNNING ? 'warning' : 'gray'} 
                             size="sm">
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {job.status === FetchStatus.COMPLETED && `${job.articlesFetched} articles fetched`}
                      {job.status === FetchStatus.RUNNING && 'In progress...'}
                      {job.status === FetchStatus.FAILED && job.errorMessage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No fetch jobs yet</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};