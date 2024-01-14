export const corsConfig = {
  origin: `http://localhost:${env('PORT')}`,
  methods: '*',
  credentials: true,
  allowedHeaders:
    'Content-Type, Accept, Authorization, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
};
