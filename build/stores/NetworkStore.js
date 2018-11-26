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

var _NetworkActions = require('../actions/NetworkActions');

var _NetworkActions2 = _interopRequireDefault(_NetworkActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NetworkStore = function () {
  function NetworkStore() {
    (0, _classCallCheck3.default)(this, NetworkStore);

    this.bindActions(_NetworkActions2.default);
    this.networks = [];
    this.pending = null;
    this.error = null;
  }

  (0, _createClass3.default)(NetworkStore, [{
    key: 'error',
    value: function error(_error) {
      this.setState({ error: _error });
    }
  }, {
    key: 'updated',
    value: function updated(networks) {
      this.setState({ error: null, networks: networks });
    }
  }, {
    key: 'pending',
    value: function pending() {
      this.setState({ pending: true });
    }
  }, {
    key: 'clearPending',
    value: function clearPending() {
      this.setState({ pending: null });
    }
  }], [{
    key: 'all',
    value: function all() {
      var state = this.getState();
      return state.networks;
    }
  }]);
  return NetworkStore;
}();

exports.default = _alt2.default.createStore(NetworkStore);
