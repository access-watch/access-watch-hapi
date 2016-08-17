'use strict';

const Hapi = require('hapi');
const AccessWatch = require('../');

const server = new Hapi.Server({debug: {log: ['AccessWatch']}});

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

  server.route({
    method: 'GET',
    path: '/',
    handler: (req, reply) => {
      reply('Well hello there, World!');
    }
  });

  server.start(err => {
    if (err) {
      throw err;
    }
  });
});

