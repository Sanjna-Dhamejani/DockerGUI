'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _RepositoryServerActions = require('../actions/RepositoryServerActions');

var _RepositoryServerActions2 = _interopRequireDefault(_RepositoryServerActions);

var _RepositoryActions = require('../actions/RepositoryActions');

var _RepositoryActions2 = _interopRequireDefault(_RepositoryActions);

var _AccountServerActions = require('../actions/AccountServerActions');

var _AccountServerActions2 = _interopRequireDefault(_AccountServerActions);

var _AccountStore = require('./AccountStore');

var _AccountStore2 = _interopRequireDefault(_AccountStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RepositoryStore = function () {
  function RepositoryStore() {
    (0, _classCallCheck3.default)(this, RepositoryStore);

    this.bindActions(_RepositoryActions2.default);
    this.bindActions(_RepositoryServerActions2.default);
    this.bindActions(_AccountServerActions2.default);
    this.results = [];
    this.recommended = [];
    this.repos = [];
    this.query = null;
    this.nextPage = null;
    this.previousPage = null;
    this.currentPage = 1;
    this.totalPage = null;
    this.reposLoading = false;
    this.recommendedLoading = false;
    this.resultsLoading = false;
    this.error = null;
  }

  (0, _createClass3.default)(RepositoryStore, [{
    key: 'error',
    value: function error(_ref) {
      var _error = _ref.error;

      this.setState({ error: _error, reposLoading: false, recommendedLoading: false, resultsLoading: false });
    }
  }, {
    key: 'repos',
    value: function repos() {
      this.setState({ reposError: null, reposLoading: true });
    }
  }, {
    key: 'reposLoading',
    value: function reposLoading() {
      this.setState({ reposLoading: true });
    }
  }, {
    key: 'reposUpdated',
    value: function reposUpdated(_ref2) {
      var repos = _ref2.repos;

      var accountState = _AccountStore2.default.getState();

      if (accountState.username && accountState.verified) {
        this.setState({ repos: repos, reposLoading: false });
      } else {
        this.setState({ repos: [], reposLoading: false });
      }
    }
  }, {
    key: 'search',
    value: function search(_ref3) {
      var query = _ref3.query,
          page = _ref3.page;

      if (this.query === query) {
        var previousPage = page - 1 < 1 ? 1 : page - 1;
        var nextPage = page + 1 > this.totalPage ? this.totalPage : page + 1;
        this.setState({ query: query, error: null, resultsLoading: true, currentPage: page, nextPage: nextPage, previousPage: previousPage });
      } else {
        this.setState({ query: query, error: null, resultsLoading: true, nextPage: null, previousPage: null, currentPage: 1, totalPage: null });
      }
    }
  }, {
    key: 'resultsUpdated',
    value: function resultsUpdated(_ref4) {
      var repos = _ref4.repos,
          page = _ref4.page,
          previous = _ref4.previous,
          next = _ref4.next,
          total = _ref4.total;

      this.setState({ results: repos, currentPage: page, previousPage: previous, nextPage: next, totalPage: total, resultsLoading: false });
    }
  }, {
    key: 'recommended',
    value: function recommended() {
      this.setState({ error: null, recommendedLoading: true });
    }
  }, {
    key: 'recommendedUpdated',
    value: function recommendedUpdated(_ref5) {
      var repos = _ref5.repos;

      this.setState({ recommended: repos, recommendedLoading: false });
    }
  }, {
    key: 'loggedout',
    value: function loggedout() {
      this.setState({ repos: [] });
    }
  }], [{
    key: 'all',
    value: function all() {
      var state = this.getState();
      var all = state.recommended.concat(state.repos).concat(state.results);
      return _underscore2.default.uniq(all, false, function (repo) {
        return repo.namespace + '/' + repo.name;
      });
    }
  }, {
    key: 'loading',
    value: function loading() {
      var state = this.getState();
      return state.recommendedLoading || state.resultsLoading || state.reposLoading;
    }
  }]);
  return RepositoryStore;
}();

exports.default = _alt2.default.createStore(RepositoryStore);
