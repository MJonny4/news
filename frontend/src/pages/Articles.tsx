import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    NewspaperIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { ArticleCard } from '@/components/ArticleCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
    useArticles,
    useDeleteArticle
} from '@/hooks/useArticles';
import { useSources, useCategories } from '@/hooks/useSources';
import { NewsType, ArticleQuery } from '@/types';
import { formatNumber } from '@/utils/formatters';

export const Articles: React.FC = () => {
    const [filters, setFilters] = useState<ArticleQuery>({
        page: 1,
        limit: 12,
        sortBy: 'publishedAt',
        sortOrder: 'desc'
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const {
        data: articlesData,
        isLoading,
        error
    } = useArticles(filters);

    const { data: sources } = useSources();
    const { data: categories } = useCategories();
    const deleteArticleMutation = useDeleteArticle();

    const articles = articlesData?.data || [];
    const pagination = articlesData?.pagination;

    // Handle filter changes
    const updateFilters = (newFilters: Partial<ArticleQuery>) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ search: searchQuery || undefined });
    };

    // Handle delete article
    const handleDeleteArticle = (id: number) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            deleteArticleMutation.mutate(id);
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            page: 1,
            limit: 12,
            sortBy: 'publishedAt',
            sortOrder: 'desc'
        });
        setSearchQuery('');
    };

    // Filter options
    const newsTypeOptions = [
        { value: '', label: 'All Types' },
        { value: NewsType.FINANCIAL, label: 'Financial' },
        { value: NewsType.GENERAL, label: 'General' },
        { value: NewsType.KEYWORD, label: 'Keyword' },
    ];

    const sortOptions = [
        { value: 'publishedAt', label: 'Published Date' },
        { value: 'createdAt', label: 'Added Date' },
        { value: 'title', label: 'Title' },
    ];

    const sortOrderOptions = [
        { value: 'desc', label: 'Newest First' },
        { value: 'asc', label: 'Oldest First' },
    ];

    const sourceOptions = [
        { value: '', label: 'All Sources' },
        ...(sources?.map(source => ({ value: source.name, label: source.name })) || [])
    ];

    const categoryOptions = [
        { value: '', label: 'All Categories' },
        ...(categories?.map(cat => ({ value: cat.slug, label: cat.name })) || [])
    ];

    const hasActiveFilters = filters.search || filters.source || filters.category || filters.newsType;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
                    <p className="text-gray-600 mt-1">
                        Browse and manage all your fetched news articles.
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center"
                    >
                        <FunnelIcon className="w-4 h-4 mr-2" />
                        Filters
                        {hasActiveFilters && (
                            <Badge variant="primary" size="sm" className="ml-2">
                                Active
                            </Badge>
                        )}
                    </Button>
                </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100 shadow-sm">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Search News Articles</h2>
                        <p className="text-gray-600 text-sm">Find articles by title, description, author, keyword, or any content</p>
                    </div>

                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                            </div>

                            <Input
                                placeholder="Search articles by title, description, author, or keyword..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-32 py-4 text-lg rounded-xl border-gray-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                            />

                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-2">
                                {(searchQuery || filters.search) && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSearchQuery('');
                                            updateFilters({ search: undefined });
                                        }}
                                        className="rounded-lg hover:bg-gray-50"
                                    >
                                        Clear
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 font-medium shadow-sm hover:shadow transition-all duration-200"
                                >
                                    Search
                                </Button>
                            </div>
                        </div>

                        {/* Search suggestions or quick filters could go here */}
                        <div className="flex flex-wrap items-center gap-2 justify-center text-sm">
                            <span className="text-gray-500 font-medium">Quick searches:</span>
                            {['financial', 'technology', 'market', 'economy'].map((term) => (
                                <button
                                    key={term}
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery(term);
                                        updateFilters({ search: term });
                                    }}
                                    className="px-3 py-1 rounded-full bg-white/60 hover:bg-white text-gray-600 hover:text-primary-700 border border-gray-200 hover:border-primary-300 transition-all duration-150 capitalize"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </form>
                </div>
            </div>

            {/* Filters Panel */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'
                }`}>
                <Card className="border-primary-100 bg-gradient-to-r from-primary-50/30 to-blue-50/30 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <FunnelIcon className="w-5 h-5 text-primary-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Filter Articles</h3>
                                {hasActiveFilters && (
                                    <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary-100 text-primary-700 font-medium">
                                        {Object.values(filters).filter(Boolean).length - 3} active
                                    </span>
                                )}
                            </div>
                            {hasActiveFilters && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                >
                                    Clear All Filters
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardBody className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            {/* Enhanced Source Select */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    <span className="flex items-center">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                                        News Source
                                    </span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.source || ''}
                                        onChange={(e) => updateFilters({ source: e.target.value || undefined })}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 appearance-none"
                                    >
                                        {sourceOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Category Select */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    <span className="flex items-center">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                        Category
                                    </span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.category || ''}
                                        onChange={(e) => updateFilters({ category: e.target.value || undefined })}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 appearance-none"
                                    >
                                        {categoryOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced News Type Select */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    <span className="flex items-center">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                                        News Type
                                    </span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.newsType || ''}
                                        onChange={(e) => updateFilters({ newsType: (e.target.value as NewsType) || undefined })}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 appearance-none"
                                    >
                                        {newsTypeOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Sort By Select */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    <span className="flex items-center">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                                        Sort By
                                    </span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.sortBy || 'publishedAt'}
                                        onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 appearance-none"
                                    >
                                        {sortOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Sort Order Select */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    <span className="flex items-center">
                                        <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                                        Order
                                    </span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.sortOrder || 'desc'}
                                        onChange={(e) => updateFilters({ sortOrder: e.target.value as any })}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 appearance-none"
                                    >
                                        {sortOrderOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                                {filters.search && (
                                    <Badge variant="primary" size="sm">
                                        Search: "{filters.search}"
                                    </Badge>
                                )}
                                {filters.source && (
                                    <Badge variant="primary" size="sm">
                                        Source: {filters.source}
                                    </Badge>
                                )}
                                {filters.category && (
                                    <Badge variant="primary" size="sm">
                                        Category: {categories?.find(c => c.slug === filters.category)?.name}
                                    </Badge>
                                )}
                                {filters.newsType && (
                                    <Badge variant="primary" size="sm">
                                        Type: {filters.newsType}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Results Summary */}
            {pagination && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {formatNumber(pagination.total)} articles
                    </span>
                    <div className="flex items-center space-x-4">
                        <span>
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                    </div>
                </div>
            )}

            {/* Articles Grid */}
            <div>
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
                                <p className="text-red-600">Error loading articles: {error.message}</p>
                                <Button
                                    className="mt-4"
                                    onClick={() => window.location.reload()}
                                >
                                    Retry
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                ) : articles.length === 0 ? (
                    <Card>
                        <CardBody>
                            <div className="text-center py-12">
                                <NewspaperIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900">
                                    {hasActiveFilters ? 'No articles match your filters' : 'No articles yet'}
                                </h3>
                                <p className="mt-2 text-gray-500">
                                    {hasActiveFilters
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'Start by creating a fetch job to gather news articles.'
                                    }
                                </p>
                                <div className="mt-6 flex justify-center space-x-3">
                                    {hasActiveFilters && (
                                        <Button variant="outline" onClick={clearFilters}>
                                            Clear Filters
                                        </Button>
                                    )}
                                    <Link to="/fetch">
                                        <Button>Create Fetch</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ) : (
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
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={!pagination.hasPrev}
                                    onClick={() => updateFilters({ page: Math.max(1, filters.page! - 1) })}
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
                                                    onClick={() => updateFilters({ page: pageNum })}
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
                                    onClick={() => updateFilters({ page: Math.min(pagination.totalPages, filters.page! + 1) })}
                                >
                                    Next
                                </Button>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Articles per page:</span>
                                <Select
                                    options={[
                                        { value: 6, label: '6' },
                                        { value: 12, label: '12' },
                                        { value: 24, label: '24' },
                                        { value: 48, label: '48' },
                                    ]}
                                    value={filters.limit || 12}
                                    onChange={(e) => updateFilters({ limit: Number(e.target.value), page: 1 })}
                                    className="w-20"
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};