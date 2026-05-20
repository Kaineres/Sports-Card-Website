declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string
    SUPABASE_SERVICE_ROLE_KEY: string
    EBAY_APP_ID: string
    INTERNAL_API_SECRET: string
    UPSTASH_REDIS_REST_URL: string
    UPSTASH_REDIS_REST_TOKEN: string
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string
    CLERK_SECRET_KEY: string
  }
}
