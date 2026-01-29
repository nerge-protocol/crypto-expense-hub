export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface RequestOptions extends RequestInit {
    token?: string;
    data?: any;
}

class ApiError extends Error {
    status: number;
    data: any;

    constructor(status: number, message: string, data?: any) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, data, ...customConfig } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        // Try to get token from localStorage if not provided explicit
        const storedKey = localStorage.getItem('merchant_secret_key');
        if (storedKey) {
            headers['Authorization'] = `Bearer ${storedKey}`;
        }
    }

    const config: RequestInit = {
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new ApiError(response.status, responseData.message || 'Something went wrong', responseData);
    }

    return responseData as T;
}

export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, data, method: 'POST' }),

    put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, data, method: 'PUT' }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'DELETE' }),
};
