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

var _RegHubUtil = require('../utils/RegHubUtil');

var _RegHubUtil2 = _interopRequireDefault(_RegHubUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RepositoryActions = function () {
  function RepositoryActions() {
    (0, _classCallCheck3.default)(this, RepositoryActions);
  }

  (0, _createClass3.default)(RepositoryActions, [{
    key: 'recommended',
    value: function recommended() {
      this.dispatch({});
      _RegHubUtil2.default.recommended();
    }
  }, {
    key: 'search',
    value: function search(query) {
      var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      this.dispatch({ query: query, page: page });
      _RegHubUtil2.default.search(query, page);
    }
  }, {
    key: 'repos',
    value: function repos() {
      this.dispatch({});
      _RegHubUtil2.default.repos();
    }
  }]);
  return RepositoryActions;
}();

exports.default = _alt2.default.createActions(RepositoryActions);
