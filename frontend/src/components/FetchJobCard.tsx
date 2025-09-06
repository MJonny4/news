import React from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  PlayCircleIcon,
  TrashIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { FetchJob, FetchStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { formatRelativeDate, getStatusColor, capitalizeFirst } from '@/utils/formatters';

interface FetchJobCardProps {
  job: FetchJob;
  onRetry?: (id: number) => void;
  onDelete?: (id: number) => void;
  isRetrying?: boolean;
  isDeleting?: boolean;
}

export const FetchJobCard: React.FC<FetchJobCardProps> = ({
  job,
  onRetry,
  onDelete,
  isRetrying = false,
  isDeleting = false,
}) => {
  const getStatusIcon = (status: FetchStatus) => {
    switch (status) {
      case FetchStatus.COMPLETED:
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case FetchStatus.FAILED:
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case FetchStatus.RUNNING:
        return <PlayCircleIcon className="w-5 h-5 text-blue-600 animate-pulse" />;
      case FetchStatus.PENDING:
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
    }
  };

  const canRetry = job.status === FetchStatus.FAILED || job.status === FetchStatus.COMPLETED;
  const canDelete = job.status !== FetchStatus.RUNNING;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Job Header */}
            <div className="flex items-center space-x-3">
              {getStatusIcon(job.status)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  &quot;{job.keyword}&quot; - {capitalizeFirst(job.newsType)}
                </h3>
                <p className="text-sm text-gray-500">
                  {job.articlesPerSource} articles per source • {job.sourceIds.length} sources
                </p>
              </div>
            </div>

            {/* Job Status */}
            <div className="mt-3 flex items-center space-x-4">
              <Badge variant={getStatusColor(job.status)}>
                {capitalizeFirst(job.status)}
              </Badge>
              
              {job.status === FetchStatus.COMPLETED && (
                <span className="text-sm text-green-600 font-medium">
                  {job.articlesFetched} articles fetched
                </span>
              )}
              
              {job.status === FetchStatus.RUNNING && job.startedAt && (
                <span className="text-sm text-blue-600">
                  Started {formatRelativeDate(job.startedAt)}
                </span>
              )}
            </div>

            {/* Error Message */}
            {job.errorMessage && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">
                  <strong>Error:</strong> {job.errorMessage}
                </p>
              </div>
            )}

            {/* Job Details */}
            <div className="mt-3 text-sm text-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {formatRelativeDate(job.createdAt)}
                </div>
                {job.completedAt && (
                  <div>
                    <span className="font-medium">Completed:</span>{' '}
                    {formatRelativeDate(job.completedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
          {canRetry && onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRetry(job.id)}
              loading={isRetrying}
              className="text-xs"
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Retry
            </Button>
          )}
          
          {canDelete && onDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(job.id)}
              loading={isDeleting}
              className="text-xs"
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};