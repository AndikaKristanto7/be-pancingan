// __mocks__/knexfile.js
module.exports = {
    development: {
      // Mock the configuration for development environment
      client: 'pg',
      useNullAsDefault: true,
    },
    test: {
      // Mock the configuration for test environment
      client: 'pg',
      useNullAsDefault: true,
    },
    production: {
      // Mock the configuration for production environment
      client: 'mysql',
    },
  };