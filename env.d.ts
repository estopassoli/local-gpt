namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production';
        DATABASE_URL: string;
        NEXT_PUBLIC_USERNAME: string;
        NEXT_PUBLIC_OLLAMA_API_URL: string;
        OLLAMA_API_URL: string;
    };
}