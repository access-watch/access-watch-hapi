'use strict';

const Hapi = require('hapi');
const AccessWatch = require('../');

const devConfig = {
  // To get debug info printed.
  debug: {
    log: ['AccessWatch']
  }
};

const prodConfig = {};

const server = new Hapi.Server(
  process.env.NODE_ENV === 'production' ? prodConfig : devConfig
);

server.connection({port: 3000});

const awCache = server.cache({
  expiresIn: 20 * 60 * 1000, // 20min ttl
  segment: 'accesswatch#'
});

server.register({
  register: AccessWatch,
  options: {
    apiKey: '1b3e63591870fdd1b3cd6eb304b81aa1',
    cache: awCache
  }
}, err => {
  if (err) {
    throw err;
  }
});

server.route({
  method: 'GET',
  path: '/',
  handler: (req, reply) => {
    reply('Hello World!');
  }
});

server.start(err => {
  if (err) {
    throw err;
  }
});
