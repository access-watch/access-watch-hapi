'use strict';

const AccessWatch = require('access-watch-node');
const Boom = require('boom');

const TAG = 'AccessWatch';

exports.register = function(server, options, next) {
  if (!options.cache) {
    // if no cache is passed, use hapi's default cache
    options = Object.assign({
      cache: server.cache({
        expiresIn: 20 * 60 * 1000, // 20min ttl
        segment: 'accesswatch#'
      })
    }, options);
  }

  const aw = new AccessWatch(options);

  // Say hello to access watch and ensure pleasent response
  aw.hello().then(_ => {
    server.log(['info', TAG], 'AccessWatch is ready!');
  }).catch(err => {
    server.log(
      ['error', TAG],
      'Error connecting to AccessWatch: ' + err.message
    );
  });

  server.ext('onRequest', (req, reply) => {
    aw.checkBlocked(req.raw.req).then(blocked => {
      if (blocked) {
        server.log(
          ['info', TAG],
          'Blocking request. HTTP headers: ' +
            JSON.stringify(req.raw.req.headers)
        );
        reply(Boom.forbidden());
      } else {
        reply.continue();
      }
    });
  });

  server.on('response', req => {
    const awLogTail = req.tail('Log to AccessWatch');
    aw.log(req.raw.req, req.raw.res).then(_ => {
      server.log(
        ['info', TAG],
        'Logged request. HTTP headers: ' + JSON.stringify(req.raw.req.headers)
      );
      awLogTail();
    }).catch(err => {
      server.log(
        ['error', TAG],
        'Error logging request. HTTP headers: ' +
          JSON.stringify(req.raw.req.headers) + '. Error: ' + err.message
      );
    });
  });

  next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
