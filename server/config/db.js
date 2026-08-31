/**
 * Database client configuration module for Montage Auto Studio.
 * Instantiates and exports the shared Prisma ORM client with environment-aware query logging.
 */

const { PrismaClient } = require('@prisma/client');

// Shared Prisma ORM client instance with environment-based logging
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

module.exports = prisma;

