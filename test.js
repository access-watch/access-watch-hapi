'use strict';
const proxyquire = require('proxyquire').noCallThru();
const test = require('tape');

test('call hello() on init', t => {
  const mockServer = {
    log: () => {},
    ext: () => {},
    on: () => {}
  };

  t.plan(2);
  const plugin = proxyquire('./index', {
    'access-watch-node': function() {
      this.hello = function() {
        t.pass('hello() was called');
        return Promise.resolve();
      };
    }
  });

  plugin.register(mockServer, {}, () => {
    t.pass('should run callback');
  });
});

test('call checkBlocked() on request', childTest => {
  const mockReq = {raw: {req: {a: 1}}};
  childTest.plan(2);
  childTest.test('handle blocked', t => {
    t.plan(5);

    const mockReply = res => {
      t.assert(res.isBoom, 'should reply with an error');
      t.assert(res.output.statusCode === 403, 'should be a 403');
    };

    mockReply.continue = () => t.fail('should not let through');

    let handleRequest = null;

    const mockServer = {
      log: () => {},
      ext: (event, handler) => {
        t.assert(event === 'onRequest', 'Add the request hook');
        handleRequest = handler;
      },
      on: () => {}
    };

    const plugin = proxyquire('./index', {
      'access-watch-node': function() {
        this.hello = () => Promise.resolve();
        this.checkBlocked = function(req) {
          t.same(req, mockReq.raw.req, 'checkBlocked(req) was called');
          return Promise.resolve(true);
        };
      }
    });

    plugin.register(mockServer, {}, () => {
      t.assert(typeof handleRequest === 'function');
      handleRequest(mockReq, mockReply);
    });
  });

  childTest.test('handle others', t => {
    t.plan(4);
    const mockReply = res => {
      t.fail('should not reply');
    };

    mockReply.continue = () => t.pass('should let through');

    let handleRequest = null;

    const mockServer = {
      log: () => {},
      ext: (event, handler) => {
        t.assert(event === 'onRequest', 'Add the request hook');
        handleRequest = handler;
      },
      on: () => {}
    };

    const plugin = proxyquire('./index', {
      'access-watch-node': function() {
        this.hello = () => Promise.resolve();
        this.checkBlocked = req => {
          t.same(req, mockReq.raw.req, 'checkBlocked(req) was called');
          return Promise.resolve(false);
        };
      }
    });

    plugin.register(mockServer, {}, () => {
      t.assert(typeof handleRequest === 'function');
      handleRequest(mockReq, mockReply);
    });
  });
});

test('call log() after response', t => {
  t.plan(5);

  const mockReq = {
    raw: {
      req: {a: 1},
      res: {b: 2}
    },
    tail: () => () => t.pass('tail is called')
  };

  let handleResponse = null;

  const mockServer = {
    log: () => {},
    ext: () => {},
    on: (event, handler) => {
      t.assert(event === 'response', 'Add the response hook');
      handleResponse = handler;
    }
  };

  const plugin = proxyquire('./index', {
    'access-watch-node': function() {

      // make these can also reject
      this.hello = () => Promise.reject();
      this.checkBlocked = req => Promise.reject();
      this.log = (req, res) => {
        t.same(req, mockReq.raw.req);
        t.same(res, mockReq.raw.res);
        return Promise.resolve();
      };
    }
  });

  plugin.register(mockServer, {}, () => {
    t.assert(typeof handleResponse === 'function');
    handleResponse(mockReq);
  });
});

