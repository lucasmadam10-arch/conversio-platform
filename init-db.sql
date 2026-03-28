-- Initialize database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create test database
SELECT 'CREATE DATABASE conversio_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'conversio_test')\gexec

-- Enable extensions on test db too
\c conversio_test
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
