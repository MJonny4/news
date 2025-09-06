import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date: string | Date, formatStr: string = 'PPP') => {
    try {
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;
        return format(parsedDate, formatStr);
    } catch {
        return 'Invalid date';
    }
};

export const formatRelativeDate = (date: string | Date) => {
    try {
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;
        return formatDistanceToNow(parsedDate, { addSuffix: true });
    } catch {
        return 'Unknown time';
    }
};

export const formatNumber = (num: number, locale: string = 'en-US') => {
    return new Intl.NumberFormat(locale).format(num);
};

export const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
};

export const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'success':
            return 'success';
        case 'running':
        case 'pending':
            return 'warning';
        case 'failed':
        case 'error':
            return 'danger';
        default:
            return 'gray';
    }
};

export const getNewsTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
        case 'financial':
            return 'primary';
        case 'general':
            return 'gray';
        case 'keyword':
            return 'warning';
        default:
            return 'gray';
    }
};

export const extractDomain = (url: string) => {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return 'Unknown';
    }
};