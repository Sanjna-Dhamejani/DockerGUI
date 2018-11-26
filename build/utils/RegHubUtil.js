'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _Util = require('../utils/Util');

var _Util2 = _interopRequireDefault(_Util);

var _HubUtil = require('../utils/HubUtil');

var _HubUtil2 = _interopRequireDefault(_HubUtil);

var _RepositoryServerActions = require('../actions/RepositoryServerActions');

var _RepositoryServerActions2 = _interopRequireDefault(_RepositoryServerActions);

var _TagServerActions = require('../actions/TagServerActions');

var _TagServerActions2 = _interopRequireDefault(_TagServerActions);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cachedRequest = require('cached-request')(_request2.default);
var cacheDirectory = _os2.default.tmpdir() + '/cachekitematic';
cachedRequest.setCacheDirectory(cacheDirectory);
cachedRequest.setValue('ttl', 3000);

var REGHUB2_ENDPOINT = process.env.REGHUB2_ENDPOINT || 'https://hub.docker.com/v2';
var searchReq = null;
var PAGING = 24;

module.exports = {
  // Normalizes results from search to v2 repository results
  normalize: function normalize(repo) {
    var obj = _underscore2.default.clone(repo);
    if (obj.is_official) {
      obj.namespace = 'library';
    } else {
      var _repo$name$split = repo.name.split('/'),
          _repo$name$split2 = (0, _slicedToArray3.default)(_repo$name$split, 2),
          namespace = _repo$name$split2[0],
          name = _repo$name$split2[1];

      obj.namespace = namespace;
      obj.name = name;
    }

    return obj;
  },

  search: function search(query, page) {
    var _this = this;

    var sorting = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    if (searchReq) {
      if (searchReq.request) {
        searchReq.request.abort();
      }
      searchReq = null;
    }

    if (!query) {
      _RepositoryServerActions2.default.resultsUpdated({ repos: [] });
    }
    /**
     * Sort:
     * All - no sorting
     * ordering: -start_count
     * ordering: -pull_count
     * is_automated: 1
     * is_official: 1
     */

    searchReq = cachedRequest({
      url: REGHUB2_ENDPOINT + '/search/repositories/?',
      qs: { query: query, page: page, page_size: PAGING, sorting: sorting }
    }, function (error, response, body) {
      if (error) {
        _RepositoryServerActions2.default.error({ error: error });
      }

      var data = JSON.parse(body);
      var repos = _underscore2.default.map(data.results, function (result) {
        result.name = result.repo_name;
        return _this.normalize(result);
      });
      var next = data.next;
      var previous = data.previous;
      var total = Math.floor(data.count / PAGING);
      if (response.statusCode === 200) {
        _RepositoryServerActions2.default.resultsUpdated({ repos: repos, page: page, previous: previous, next: next, total: total });
      }
    });
  },

  recommended: function recommended() {
    cachedRequest({
      url: 'https://kitematic.com/recommended.json'
    }, function (error, response, body) {
      if (error) {
        _RepositoryServerActions2.default.error({ error: error });
        return;
      }

      if (response.statusCode !== 200) {
        _RepositoryServerActions2.default.error({ error: new Error('Could not fetch recommended repo list. Please try again later.') });
        return;
      }

      var data = JSON.parse(body);
      var repos = data.repos;
      _async2.default.map(repos, function (repo, cb) {
        var name = repo.repo;
        if (_Util2.default.isOfficialRepo(name)) {
          name = 'library/' + name;
        }

        cachedRequest({
          url: REGHUB2_ENDPOINT + '/repositories/' + name
        }, function (error, response, body) {
          if (error) {
            _RepositoryServerActions2.default.error({ error: error });
            return;
          }

          if (response.statusCode === 200) {
            var _data = JSON.parse(body);
            _data.is_recommended = true;
            _underscore2.default.extend(_data, repo);
            cb(null, _data);
          } else {
            _RepositoryServerActions2.default.error({ error: new Error('Could not fetch repository information from Docker Hub.') });
            return;
          }
        });
      }, function (error, repos) {
        _RepositoryServerActions2.default.recommendedUpdated({ repos: repos });
      });
    });
  },

  tags: function tags(repo, callback) {
    _HubUtil2.default.request({
      url: REGHUB2_ENDPOINT + '/repositories/' + repo + '/tags',
      qs: { page: 1, page_size: 100 }
    }, function (error, response, body) {
      if (response.statusCode === 200) {
        var data = JSON.parse(body);
        _TagServerActions2.default.tagsUpdated({ repo: repo, tags: data.results || [] });
        if (callback) {
          return callback(null, data.results || []);
        }
      } else {
        _RepositoryServerActions2.default.error({ repo: repo });
        if (callback) {
          return callback(new Error('Failed to fetch tags for repo'));
        }
      }
    });
  },

  // Returns the base64 encoded index token or null if no token exists
  repos: function repos(callback) {
    _RepositoryServerActions2.default.reposLoading({ repos: [] });
    var namespaces = [];
    // Get Orgs for user
    _HubUtil2.default.request({
      url: REGHUB2_ENDPOINT + '/user/orgs/',
      qs: { page_size: 1000 }
    }, function (orgError, orgResponse, orgBody) {
      if (orgError) {
        _RepositoryServerActions2.default.error({ orgError: orgError });
        if (callback) {
          return callback(orgError);
        }
        return null;
      }

      if (orgResponse.statusCode === 401) {
        _HubUtil2.default.logout();
        _RepositoryServerActions2.default.reposUpdated({ repos: [] });
        return;
      }

      if (orgResponse.statusCode !== 200) {
        var generalError = new Error('Failed to fetch repos');
        _RepositoryServerActions2.default.error({ error: generalError });
        if (callback) {
          callback({ error: generalError });
        }
        return null;
      }
      try {
        var orgs = JSON.parse(orgBody);
        orgs.results.map(function (org) {
          namespaces.push(org.orgname);
        });
        // Add current user
        namespaces.push(_HubUtil2.default.username());
      } catch (jsonError) {
        _RepositoryServerActions2.default.error({ jsonError: jsonError });
        if (callback) {
          return callback(jsonError);
        }
      }

      _async2.default.map(namespaces, function (namespace, cb) {
        _HubUtil2.default.request({
          url: REGHUB2_ENDPOINT + '/repositories/' + namespace,
          qs: { page_size: 1000 }
        }, function (error, response, body) {
          if (error) {
            _RepositoryServerActions2.default.error({ error: error });
            if (callback) {
              callback(error);
            }
            return null;
          }

          if (orgResponse.statusCode === 401) {
            _HubUtil2.default.logout();
            _RepositoryServerActions2.default.reposUpdated({ repos: [] });
            return;
          }

          if (response.statusCode !== 200) {
            _RepositoryServerActions2.default.error({ error: new Error('Could not fetch repository information from Docker Hub.') });
            return null;
          }

          var data = JSON.parse(body);
          cb(null, data.results);
        });
      }, function (error, lists) {
        if (error) {
          _RepositoryServerActions2.default.error({ error: error });
          if (callback) {
            callback(error);
          }
          return null;
        }

        var repos = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = (0, _getIterator3.default)(lists), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var list = _step.value;

            repos = repos.concat(list);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        _underscore2.default.each(repos, function (repo) {
          repo.is_user_repo = true;
        });

        _RepositoryServerActions2.default.reposUpdated({ repos: repos });
        if (callback) {
          return callback(null, repos);
        }
        return null;
      });
    });
  }
};
