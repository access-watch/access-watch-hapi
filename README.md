Hapi Access Watch plugin [![Build Status](https://travis-ci.org/access-watch/access-watch-hapi.svg?branch=master)](https://travis-ci.org/access-watch/access-watch-hapi) [![Coverage Status](https://coveralls.io/repos/github/access-watch/access-watch-hapi/badge.svg?branch=master&flushcache)](https://coveralls.io/github/access-watch/access-watch-hapi?branch=master)
-----

Hapi Plugin for logging an analyzing web traffic using the AccessWatch service.

## Installation ##

```
npm install --save access-watch-hapi 
```

## Usage ##

Using the plugin is easy, Hapi provides has we need. The `config` object is
directly passed to `access-watch-node`. Required parameters are `apiKey` and
`cache`. If your hapi application is behind a reverse proxy, you also need to
set `fwdHeaders`. Please see
[access-watch-node](https://github.com/access-watch/access-watch-node) for
details.

## Debugging ##

To enable verbose logging pass `{debug: {log: ['AccessWatch']}}`

## Example ##

```js
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
    apiKey: '{API-KEY}',
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
```

Try it out by cloning this repo and run

```
npm install
npm run example
```

