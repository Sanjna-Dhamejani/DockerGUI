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

var TagActions = function () {
  function TagActions() {
    (0, _classCallCheck3.default)(this, TagActions);
  }

  (0, _createClass3.default)(TagActions, [{
    key: 'tags',
    value: function tags(repo) {
      this.dispatch({ repo: repo });
      _RegHubUtil2.default.tags(repo);
    }
  }, {
    key: 'localTags',
    value: function localTags(repo, tags) {
      this.dispatch({ repo: repo, tags: tags });
    }
  }]);
  return TagActions;
}();

exports.default = _alt2.default.createActions(TagActions);
