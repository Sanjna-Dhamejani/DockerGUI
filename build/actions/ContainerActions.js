'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _DockerUtil = require('../utils/DockerUtil');

var _DockerUtil2 = _interopRequireDefault(_DockerUtil);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContainerActions = function () {
  function ContainerActions() {
    (0, _classCallCheck3.default)(this, ContainerActions);
  }

  (0, _createClass3.default)(ContainerActions, [{
    key: 'destroy',
    value: function destroy(name) {
      _DockerUtil2.default.destroy(name);
    }
  }, {
    key: 'rename',
    value: function rename(name, newName) {
      this.dispatch({ name: name, newName: newName });
      _DockerUtil2.default.rename(name, newName);
    }
  }, {
    key: 'start',
    value: function start(name) {
      this.dispatch({ name: name });
      _DockerUtil2.default.start(name);
    }
  }, {
    key: 'stop',
    value: function stop(name) {
      _DockerUtil2.default.stop(name);
    }
  }, {
    key: 'restart',
    value: function restart(name) {
      this.dispatch({ name: name });
      _DockerUtil2.default.restart(name);
    }
  }, {
    key: 'update',
    value: function update(name, container) {
      this.dispatch({ name: name, container: container });
      _DockerUtil2.default.updateContainer(name, container);
    }
  }, {
    key: 'clearPending',
    value: function clearPending() {
      this.dispatch();
    }
  }, {
    key: 'run',
    value: function run(name, repo, tag, network) {
      var local = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

      _DockerUtil2.default.run(name, repo, tag, network, local);
    }
  }, {
    key: 'active',
    value: function active(name) {
      _DockerUtil2.default.active(name);
    }
  }, {
    key: 'toggleFavorite',
    value: function toggleFavorite(name) {
      var favorites = JSON.parse(localStorage.getItem('containers.favorites')) || [];
      if (favorites.includes(name)) {
        favorites = favorites.filter(function (favoriteName) {
          return favoriteName !== name;
        });
      } else {
        favorites = [].concat((0, _toConsumableArray3.default)(favorites), [name]);
      }
      localStorage.setItem('containers.favorites', (0, _stringify2.default)(favorites));
      this.dispatch({ name: name });
    }
  }]);
  return ContainerActions;
}();

exports.default = _alt2.default.createActions(ContainerActions);
