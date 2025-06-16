import axios from "axios";

// Create axios instance with base configuration
export const apiClient = axios.create({
	baseURL:
		import.meta.env.VITE_API_BASE_URL || "https://your-api-gateway-url",
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 10000,
});

// Request interceptor for adding auth tokens if needed
apiClient.interceptors.request.use(
	(config) => {
		const data = localStorage.getItem("auth");
		const token = data ? JSON.parse(data).idToken : null;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		// Handle common errors here
		if (error.response?.status === 401) {
			// Handle unauthorized access
			console.error("Unauthorized access");
		}
		return Promise.reject(error);
	}
);
