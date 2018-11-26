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

var _ContainerServerActions = require('../actions/ContainerServerActions');

var _ContainerServerActions2 = _interopRequireDefault(_ContainerServerActions);

var _ContainerActions = require('../actions/ContainerActions');

var _ContainerActions2 = _interopRequireDefault(_ContainerActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MAX_LOG_SIZE = 3000;

var ContainerStore = function () {
  function ContainerStore() {
    (0, _classCallCheck3.default)(this, ContainerStore);

    this.bindActions(_ContainerActions2.default);
    this.bindActions(_ContainerServerActions2.default);
    this.containers = {};

    // Pending container to create
    this.pending = null;
  }

  (0, _createClass3.default)(ContainerStore, [{
    key: 'error',
    value: function error(_ref) {
      var name = _ref.name,
          _error = _ref.error;

      var containers = this.containers;
      if (containers[name]) {
        containers[name].Error = _error;
      }
      this.setState({ containers: containers });
    }
  }, {
    key: 'start',
    value: function start(_ref2) {
      var name = _ref2.name;

      var containers = this.containers;
      if (containers[name]) {
        containers[name].State.Starting = true;
        this.setState({ containers: containers });
      }
    }
  }, {
    key: 'started',
    value: function started(_ref3) {
      var name = _ref3.name;

      var containers = this.containers;
      if (containers[name]) {
        containers[name].State.Starting = false;
        containers[name].State.Updating = false;
        this.setState({ containers: containers });
      }
    }
  }, {
    key: 'stopped',
    value: function stopped(_ref4) {
      var id = _ref4.id;

      var containers = this.containers;
      var container = _underscore2.default.find(_underscore2.default.values(containers), function (c) {
        return c.Id === id || c.Name === id;
      });

      if (containers[container.Name]) {
        containers[container.Name].State.Stopping = false;
        this.setState({ containers: containers });
      }
    }
  }, {
    key: 'kill',
    value: function kill(_ref5) {
      var id = _ref5.id;

      var containers = this.containers;
      var container = _underscore2.default.find(_underscore2.default.values(containers), function (c) {
        return c.Id === id || c.Name === id;
      });

      if (containers[container.Name]) {
        containers[container.Name].State.Stopping = true;
        this.setState({ containers: containers });
      }
    }
  }, {
    key: 'rename',
    value: function rename(_ref6) {
      var name = _ref6.name,
          newName = _ref6.newName;

      var containers = this.containers;
      var data = containers[name];
      data.Name = newName;

      if (data.State) {
        data.State.Updating = true;
      }

      containers[newName] = data;
      delete containers[name];
      this.setState({ containers: containers });
    }
  }, {
    key: 'added',
    value: function added(_ref7) {
      var container = _ref7.container;

      var containers = this.containers;
      containers[container.Name] = container;
      this.setState({ containers: containers });
    }
  }, {
    key: 'update',
    value: function update(_ref8) {
      var name = _ref8.name,
          container = _ref8.container;

      var containers = this.containers;
      if (containers[name] && containers[name].State && containers[name].State.Updating) {
        return;
      }

      if (containers[name].State.Stopping) {
        return;
      }

      _underscore2.default.extend(containers[name], container);

      if (containers[name].State) {
        containers[name].State.Updating = true;
      }

      this.setState({ containers: containers });
    }
  }, {
    key: 'updated',
    value: function updated(_ref9) {
      var container = _ref9.container;

      if (!container || !container.Name) {
        return;
      }

      var containers = this.containers;
      if (containers[container.Name] && containers[container.Name].State.Updating) {
        return;
      }

      if (containers[container.Name] && containers[container.Name].Logs) {
        container.Logs = containers[container.Name].Logs;
      }

      containers[container.Name] = container;
      this.setState({ containers: containers });
    }
  }, {
    key: 'allUpdated',
    value: function allUpdated(_ref10) {
      var containers = _ref10.containers;

      this.setState({ containers: containers });
    }

    // Receives the name of the container and columns of progression
    // A column represents progression for one or more layers

  }, {
    key: 'progress',
    value: function progress(_ref11) {
      var name = _ref11.name,
          _progress = _ref11.progress;

      var containers = this.containers;

      if (containers[name]) {
        containers[name].Progress = _progress;
      }

      this.setState({ containers: containers });
    }
  }, {
    key: 'destroyed',
    value: function destroyed(_ref12) {
      var id = _ref12.id;

      var containers = this.containers;
      var container = _underscore2.default.find(_underscore2.default.values(containers), function (c) {
        return c.Id === id || c.Name === id;
      });

      if (container && container.State && container.State.Updating) {
        return;
      }

      if (container) {
        delete containers[container.Name];
        this.setState({ containers: containers });
      }
    }
  }, {
    key: 'waiting',
    value: function waiting(_ref13) {
      var name = _ref13.name,
          _waiting = _ref13.waiting;

      var containers = this.containers;
      if (containers[name]) {
        containers[name].State.Waiting = _waiting;
      }
      this.setState({ containers: containers });
    }
  }, {
    key: 'pending',
    value: function pending(_ref14) {
      var repo = _ref14.repo,
          tag = _ref14.tag;

      var pending = { repo: repo, tag: tag };
      this.setState({ pending: pending });
    }
  }, {
    key: 'clearPending',
    value: function clearPending() {
      this.setState({ pending: null });
    }
  }, {
    key: 'log',
    value: function log(_ref15) {
      var name = _ref15.name,
          entry = _ref15.entry;

      var container = this.containers[name];
      if (!container) {
        return;
      }

      if (!container.Logs) {
        container.Logs = [];
      }

      container.Logs.push.apply(container.Logs, entry.split('\n').filter(function (e) {
        return e.length;
      }));
      container.Logs = container.Logs.slice(container.Logs.length - MAX_LOG_SIZE, MAX_LOG_SIZE);
      this.emitChange();
    }
  }, {
    key: 'logs',
    value: function logs(_ref16) {
      var name = _ref16.name,
          _logs = _ref16.logs;

      var container = this.containers[name];

      if (!container) {
        return;
      }

      container.Logs = _logs.split('\n');
      container.Logs = container.Logs.slice(container.Logs.length - MAX_LOG_SIZE, MAX_LOG_SIZE);
      this.emitChange();
    }
  }, {
    key: 'toggleFavorite',
    value: function toggleFavorite(_ref17) {
      var name = _ref17.name;

      var containers = this.containers;

      if (containers[name]) {
        containers[name].Favorite = !containers[name].Favorite;
      }

      this.setState({ containers: containers });
    }
  }], [{
    key: 'generateName',
    value: function generateName(repo) {
      var base = _underscore2.default.last(repo.split('/'));
      var names = _underscore2.default.keys(this.getState().containers);
      var count = 1;
      var name = base;
      while (true) {
        if (names.indexOf(name) === -1) {
          return name;
        } else {
          count++;
          name = base + '-' + count;
        }
      }
    }
  }]);
  return ContainerStore;
}();

exports.default = _alt2.default.createStore(ContainerStore);
