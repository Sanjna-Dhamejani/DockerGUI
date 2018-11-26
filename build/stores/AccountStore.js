'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _AccountServerActions = require('../actions/AccountServerActions');

var _AccountServerActions2 = _interopRequireDefault(_AccountServerActions);

var _AccountActions = require('../actions/AccountActions');

var _AccountActions2 = _interopRequireDefault(_AccountActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AccountStore = function () {
  function AccountStore() {
    (0, _classCallCheck3.default)(this, AccountStore);

    this.bindActions(_AccountServerActions2.default);
    this.bindActions(_AccountActions2.default);

    this.prompted = false;
    this.loading = false;
    this.errors = {};

    this.verified = false;
    this.username = null;
  }

  (0, _createClass3.default)(AccountStore, [{
    key: 'skip',
    value: function skip() {
      this.setState({
        prompted: true
      });
    }
  }, {
    key: 'login',
    value: function login() {
      this.setState({
        loading: true,
        errors: {}
      });
    }
  }, {
    key: 'logout',
    value: function logout() {
      this.setState({
        loading: false,
        errors: {},
        username: null,
        verified: false
      });
    }
  }, {
    key: 'signup',
    value: function signup() {
      this.setState({
        loading: true,
        errors: {}
      });
    }
  }, {
    key: 'loggedin',
    value: function loggedin(_ref) {
      var username = _ref.username,
          verified = _ref.verified;

      this.setState({ username: username, verified: verified, errors: {}, loading: false });
    }
  }, {
    key: 'loggedout',
    value: function loggedout() {
      this.setState({
        loading: false,
        errors: {},
        username: null,
        verified: false
      });
    }
  }, {
    key: 'signedup',
    value: function signedup(_ref2) {
      var username = _ref2.username;

      this.setState({ username: username, errors: {}, loading: false });
    }
  }, {
    key: 'verify',
    value: function verify() {
      this.setState({ loading: true });
    }
  }, {
    key: 'verified',
    value: function verified(_ref3) {
      var _verified = _ref3.verified;

      this.setState({ verified: _verified, loading: false });
    }
  }, {
    key: 'prompted',
    value: function prompted(_ref4) {
      var _prompted = _ref4.prompted;

      this.setState({ prompted: _prompted });
    }
  }, {
    key: 'errors',
    value: function errors(_ref5) {
      var _errors = _ref5.errors;

      this.setState({ errors: _errors, loading: false });
    }
  }]);
  return AccountStore;
}();

exports.default = _alt2.default.createStore(AccountStore);
