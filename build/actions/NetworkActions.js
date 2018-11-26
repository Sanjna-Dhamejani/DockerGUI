'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NetworkActions = function NetworkActions() {
  (0, _classCallCheck3.default)(this, NetworkActions);

  this.generateActions('updated', 'error', 'pending', 'clearPending');
};

exports.default = _alt2.default.createActions(NetworkActions);
