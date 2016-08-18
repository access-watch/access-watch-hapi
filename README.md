Hapi Access Watch plugin [![Build Status](https://travis-ci.org/access-watch/access-watch-hapi.svg?branch=master)](https://travis-ci.org/access-watch/access-watch-hapi) [![Coverage Status](https://coveralls.io/repos/github/access-watch/access-watch-hapi/badge.svg?branch=master&flushcache)](https://coveralls.io/github/access-watch/access-watch-hapi?branch=master)
-----

Hapi Plugin for logging an analyzing web traffic using the AccessWatch service.

## Installation ##

```
npm install --save access-watch-hapi 
```

## Usage ##

The plugin is registered like any hapi plugin, on the `server` instance:

```js
const server = new Hapi.Server();
server.register({
  register: AccessWatch,
  options: {
    // these are directly passed to access-watch-node
    apiKey: '{API-KEY}',
    // optionally pass a custom cache client here, ie
    // otherwise hapi's default is used
    cache: server.cache({
      cache: 'redis'
      expiresIn: 20 * 60 * 1000, // 20min ttl
      segment: 'accesswatch#'
    });

    // If the server runs behind a reverse proxy that sets the standard
    // forwarded headers. See the links below
    fwdHeaders: AccessWatch.fwdHeaders
  }
});
```

The `config` object is directly passed to `access-watch-node`. The only required
parameter is `apiKey`. **If your hapi server is behind a reverse proxy**, you
also need to set
[`fwdHeaders`](https://github.com/access-watch/access-watch-node/blob/master/api.md#accesswatchfwdheaders--accesswatchforwardheaders).
These are not set by default.
Please see
[access-watch-node](https://github.com/access-watch/access-watch-node) for
details.

## Debugging ##

To enable verbose logging pass `{debug: {log: ['AccessWatch']}}`

## Example ##

[See the example](./example/server.js)

Try it out by cloning this repo and run

```
npm install
npm install hapi
npm run example
```
