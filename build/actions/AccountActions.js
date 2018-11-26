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

var _HubUtil = require('../utils/HubUtil');

var _HubUtil2 = _interopRequireDefault(_HubUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AccountActions = function () {
  function AccountActions() {
    (0, _classCallCheck3.default)(this, AccountActions);
  }

  (0, _createClass3.default)(AccountActions, [{
    key: 'login',
    value: function login(username, password) {
      this.dispatch({});
      _HubUtil2.default.login(username, password);
    }
  }, {
    key: 'signup',
    value: function signup(username, password, email, subscribe) {
      this.dispatch({});
      _HubUtil2.default.signup(username, password, email, subscribe);
    }
  }, {
    key: 'logout',
    value: function logout() {
      this.dispatch({});
      _HubUtil2.default.logout();
    }
  }, {
    key: 'skip',
    value: function skip() {
      this.dispatch({});
      _HubUtil2.default.setPrompted(true);
    }
  }, {
    key: 'verify',
    value: function verify() {
      this.dispatch({});
      _HubUtil2.default.verify();
    }
  }]);
  return AccountActions;
}();

exports.default = _alt2.default.createActions(AccountActions);
