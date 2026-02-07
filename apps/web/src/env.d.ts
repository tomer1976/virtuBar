/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_USE_MOCK_AUTH?: string;
	readonly VITE_USE_MOCK_PROFILE?: string;
	readonly VITE_USE_MOCK_ROOMS?: string;
	readonly VITE_USE_MOCK_REALTIME?: string;
	readonly VITE_USE_MOCK_VOICE?: string;
	readonly VITE_REALTIME_PROVIDER?: string;
	readonly VITE_REALTIME_DEBUG?: string;
	readonly VITE_REALTIME_LOG_EVENTS?: string;
}
