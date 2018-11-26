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

var _TagActions = require('../actions/TagActions');

var _TagActions2 = _interopRequireDefault(_TagActions);

var _TagServerActions = require('../actions/TagServerActions');

var _TagServerActions2 = _interopRequireDefault(_TagServerActions);

var _AccountServerActions = require('../actions/AccountServerActions');

var _AccountServerActions2 = _interopRequireDefault(_AccountServerActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TagStore = function () {
  function TagStore() {
    (0, _classCallCheck3.default)(this, TagStore);

    this.bindActions(_TagActions2.default);
    this.bindActions(_TagServerActions2.default);
    this.bindActions(_AccountServerActions2.default);

    // maps 'namespace/name' => [list of tags]
    this.tags = {};

    // maps 'namespace/name' => true / false
    this.loading = {};
  }

  (0, _createClass3.default)(TagStore, [{
    key: 'tags',
    value: function tags(_ref) {
      var repo = _ref.repo;

      this.loading[repo] = true;
      this.emitChange();
    }
  }, {
    key: 'localTags',
    value: function localTags(_ref2) {
      var repo = _ref2.repo,
          tags = _ref2.tags;

      var data = [];
      tags.map(function (value) {
        data.push({ 'name': value });
      });
      this.loading[repo] = true;
      this.tagsUpdated({ repo: repo, tags: data || [] });
    }
  }, {
    key: 'tagsUpdated',
    value: function tagsUpdated(_ref3) {
      var repo = _ref3.repo,
          tags = _ref3.tags;

      this.tags[repo] = tags;
      this.loading[repo] = false;
      this.emitChange();
    }
  }, {
    key: 'remove',
    value: function remove(_ref4) {
      var repo = _ref4.repo;

      delete this.tags[repo];
      delete this.loading[repo];
      this.emitChange();
    }
  }, {
    key: 'loggedout',
    value: function loggedout() {
      this.loading = {};
      this.tags = {};
      this.emitChange();
    }
  }, {
    key: 'error',
    value: function error(_ref5) {
      var repo = _ref5.repo;

      this.loading[repo] = false;
      this.emitChange();
    }
  }]);
  return TagStore;
}();

exports.default = _alt2.default.createStore(TagStore);
