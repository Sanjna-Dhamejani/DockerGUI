'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _request2 = require('request');

var _request3 = _interopRequireDefault(_request2);

var _AccountServerActions = require('../actions/AccountServerActions');

var _AccountServerActions2 = _interopRequireDefault(_AccountServerActions);

var _MetricsUtil = require('./MetricsUtil');

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HUB2_ENDPOINT = process.env.HUB2_ENDPOINT || 'https://hub.docker.com/v2';

module.exports = {
  init: function init() {
    _AccountServerActions2.default.prompted({ prompted: localStorage.getItem('auth.prompted') });
    var username = localStorage.getItem('auth.username');
    var verified = localStorage.getItem('auth.verified') === 'true';
    if (username) {
      _AccountServerActions2.default.loggedin({ username: username, verified: verified });
    }
  },

  username: function username() {
    return localStorage.getItem('auth.username') || null;
  },

  // Returns the base64 encoded index token or null if no token exists
  config: function config() {
    var config = localStorage.getItem('auth.config');
    if (!config) {
      return null;
    }
    return config;
  },

  // Retrives the current jwt hub token or null if no token exists
  jwt: function jwt() {
    var jwt = localStorage.getItem('auth.jwt');
    if (!jwt) {
      return null;
    }
    return jwt;
  },

  prompted: function prompted() {
    return localStorage.getItem('auth.prompted');
  },

  setPrompted: function setPrompted(prompted) {
    localStorage.setItem('auth.prompted', true);
    _AccountServerActions2.default.prompted({ prompted: prompted });
  },

  request: function request(req, callback) {
    var _this = this;

    var jwt = this.jwt();

    if (jwt) {
      _underscore2.default.extend(req, {
        headers: {
          Authorization: 'JWT ' + jwt
        }
      });
    }

    // First attempt with existing JWT
    (0, _request3.default)(req, function (error, response, body) {
      var data = void 0;
      try {
        data = JSON.parse(body);
      } catch (e) {
        console.error('Json parse error: %o', e);
      }

      // If the JWT has expired, then log in again to get a new JWT
      if (data && data.detail && data.detail.indexOf('expired') !== -1) {
        var config = _this.config();
        if (!_this.config()) {
          _this.logout();
          return;
        }

        var _creds = _this.creds(config),
            _creds2 = (0, _slicedToArray3.default)(_creds, 2),
            username = _creds2[0],
            password = _creds2[1];

        _this.auth(username, password, function (error, response, body) {
          var data = JSON.parse(body);
          if (response.statusCode === 200 && data && data.token) {
            localStorage.setItem('auth.jwt', data.token);
            _this.request(req, callback);
          } else {
            _this.logout();
          }
        });
      } else {
        callback(error, response, body);
      }
    });
  },

  loggedin: function loggedin() {
    return this.jwt() && this.config();
  },

  logout: function logout() {
    _AccountServerActions2.default.loggedout();
    localStorage.removeItem('auth.jwt');
    localStorage.removeItem('auth.username');
    localStorage.removeItem('auth.verified');
    localStorage.removeItem('auth.config');

    this.request({
      url: HUB2_ENDPOINT + '/logout'
    }, function (error, response, body) {});
  },

  login: function login(username, password, callback) {
    this.auth(username, password, function (error, response, body) {
      if (error) {
        _AccountServerActions2.default.errors({ errors: { detail: error.message } });
        callback(error);
        return;
      }

      var data = JSON.parse(body);

      if (response.statusCode === 200) {
        if (data.token) {
          localStorage.setItem('auth.jwt', data.token);
          localStorage.setItem('auth.username', username);
          localStorage.setItem('auth.verified', true);
          localStorage.setItem('auth.config', new Buffer(username + ':' + password).toString('base64'));
          _AccountServerActions2.default.loggedin({ username: username, verified: true });
          _AccountServerActions2.default.prompted({ prompted: true });
          _MetricsUtil2.default.track('Successfully Logged In');
          if (callback) {
            callback();
          }
          require('./RegHubUtil').repos();
        } else {
          _AccountServerActions2.default.errors({ errors: { detail: 'Did not receive login token.' } });
          if (callback) {
            callback(new Error('Did not receive login token.'));
          }
        }
      } else if (response.statusCode === 401) {
        if (data && data.detail && data.detail.indexOf('Account not active yet') !== -1) {
          _AccountServerActions2.default.loggedin({ username: username, verified: false });
          _AccountServerActions2.default.prompted({ prompted: true });
          localStorage.setItem('auth.username', username);
          localStorage.setItem('auth.verified', false);
          localStorage.setItem('auth.config', new Buffer(username + ':' + password).toString('base64'));
          if (callback) {
            callback();
          }
        } else {
          _AccountServerActions2.default.errors({ errors: data });
          if (callback) {
            callback(new Error(data.detail));
          }
        }
      }
    });
  },

  auth: function auth(username, password, callback) {
    _request3.default.post(HUB2_ENDPOINT + '/users/login/', { form: { username: username, password: password } }, function (error, response, body) {
      callback(error, response, body);
    });
  },

  verify: function verify() {
    var config = this.config();
    if (!config) {
      this.logout();
      return;
    }

    var _creds3 = this.creds(config),
        _creds4 = (0, _slicedToArray3.default)(_creds3, 2),
        username = _creds4[0],
        password = _creds4[1];

    this.login(username, password);
  },

  creds: function creds(config) {
    return new Buffer(config, 'base64').toString().split(/:(.+)?/).slice(0, 2);
  },

  // Signs up and places a token under ~/.dockercfg and saves a jwt to localstore
  signup: function signup(username, password, email, subscribe) {
    _request3.default.post(HUB2_ENDPOINT + '/users/signup/', {
      form: {
        username: username,
        password: password,
        email: email,
        subscribe: subscribe
      }
    }, function (err, response, body) {
      if (response && response.statusCode === 204) {
        _AccountServerActions2.default.signedup({ username: username, verified: false });
        _AccountServerActions2.default.prompted({ prompted: true });
        localStorage.setItem('auth.username', username);
        localStorage.setItem('auth.verified', false);
        localStorage.setItem('auth.config', new Buffer(username + ':' + password).toString('base64'));
        _MetricsUtil2.default.track('Successfully Signed Up');
      } else {
        var data = JSON.parse(body);
        var errors = {};
        for (var key in data) {
          errors[key] = data[key][0];
        }
        _AccountServerActions2.default.errors({ errors: errors });
      }
    });
  }
};
