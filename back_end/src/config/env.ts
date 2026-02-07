import 'dotenv/config'

function requireEnv(name: string): string {
    const value = process.env[name];
    
    if (value === undefined) {
        throw Error(`Environment variable ${name} is required but not set.`);
    }
    
    return value;
}

export const env = {
    PORT: process.env.PORT || '3000',
    NODE_ENV: process.env.NODE_ENV || 'dev',
    ALLOWED_ORIGIN: requireEnv('ALLOWED_ORIGIN'),
    DATABASE_URL: requireEnv('DATABASE_URL'),
}

