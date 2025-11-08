import 'dotenv/config';

export const appSettings = {
    appName: process.env.APP_NAME,
    development: JSON.parse(process.env.DEVELOPMENT || 'false'),
    timeZone: process.env.TIME_ZONE,
    timeZoneDB: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        getCurrentTime() {
            return new Date().toLocaleString('en-US', { timeZone: appSettings.timeZone });
        },
        getCustomTime(time: string) {
            return new Date(time).toLocaleString('en-US', { timeZone: appSettings.timeZone });
        }
    },
    sessionSecret: process.env.SESSION_SECRET,
    mainLanguage: process.env.MAIN_LANGUAGE,
    port: process.env.PORT,
    prefixApi: process.env.PREFIX_API,
    corsOrigin: [
        process.env.CORS_ORIGIN_FE1,
        process.env.CORS_ORIGIN_FE2,
    ],
    typeDeployment: process.env.TYPE_DEPLOYMENT,
    mongo: {
        url: process.env.MONGO_URL,
        dbName: process.env.DB_NAME,
    },
    jwtSecret: process.env.JWT_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    issuer: process.env.ISSUER,
    expireIn: process.env.EXPIRE_IN || '1h',
    refreshExpireIn: process.env.REFRESH_EXPIRE_IN,
    apiKey: process.env.API_KEY,
    storage_type: process.env.STORAGE_TYPE,
    r2: {
        region: "auto",
        endpoint: process.env.R2_ENDPOINT || '',
        credentials: {
            accessKeyId: process.env.R2_KEY || '',
            secretAccessKey: process.env.R2_SECRET || '',
        },
        bucketName: process.env.R2_BUCKET || '',
        folder: process.env.R2_FOLDER || '',
        public: process.env.R2_PUBLIC || '',
    },
    postgres: {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        user: process.env.POSTGRES_USER || 'user',
        password: process.env.POSTGRES_PASSWORD || 'password',
        database: process.env.POSTGRES_DB || 'database',
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME,
    },
    email: {
        service: process.env.EMAIL_SERVICE || 'gmail',
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
    },
    aws: {
        sqs: {
            "region": process.env.AWS_SQS_REGION || 'ap-southeast-1',
            "credentials": {
                "accessKeyId": process.env.AWS_SQS_ACCESS_KEY_ID || '',
                "secretAccessKey": process.env.AWS_SQS_SECRET_ACCESS_KEY || ''
            },
            "queue_url": process.env.AWS_SQS_QUEUE_URL || '',
        }
    }
};