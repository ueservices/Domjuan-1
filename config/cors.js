// CORS configuration for production security
const corsOptions = {
    origin: function (origin, callback) {
        // In development, allow any origin
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        // Production allowed origins
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            process.env.DOMAIN_URL,
            'https://domjuan.herokuapp.com',
            'https://domjuan.vercel.app'
        ].filter(Boolean); // Remove undefined values

        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-CSRF-Token'
    ]
};

module.exports = corsOptions;