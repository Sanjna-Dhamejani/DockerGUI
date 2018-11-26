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

var _SetupServerActions = require('../actions/SetupServerActions');

var _SetupServerActions2 = _interopRequireDefault(_SetupServerActions);

var _SetupActions = require('../actions/SetupActions');

var _SetupActions2 = _interopRequireDefault(_SetupActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SetupStore = function () {
  function SetupStore() {
    (0, _classCallCheck3.default)(this, SetupStore);

    this.bindActions(_SetupActions2.default);
    this.bindActions(_SetupServerActions2.default);
    this.started = false;
    this.progress = null;
    this.error = null;
  }

  (0, _createClass3.default)(SetupStore, [{
    key: 'started',
    value: function started(_ref) {
      var _started = _ref.started;

      this.setState({ error: null, started: _started });
    }
  }, {
    key: 'error',
    value: function error(_ref2) {
      var _error = _ref2.error;

      this.setState({ error: _error, progress: null });
    }
  }, {
    key: 'progress',
    value: function progress(_ref3) {
      var _progress = _ref3.progress;

      this.setState({ progress: _progress });
    }
  }]);
  return SetupStore;
}();

exports.default = _alt2.default.createStore(SetupStore);
