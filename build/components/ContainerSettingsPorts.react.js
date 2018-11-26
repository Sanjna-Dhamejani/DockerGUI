"use strict";

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _addons = require("react/addons");

var _addons2 = _interopRequireDefault(_addons);

var _electron = require("electron");

var _ContainerUtil = require("../utils/ContainerUtil");

var _ContainerUtil2 = _interopRequireDefault(_ContainerUtil);

var _ContainerActions = require("../actions/ContainerActions");

var _ContainerActions2 = _interopRequireDefault(_ContainerActions);

var _ContainerStore = require("../stores/ContainerStore");

var _ContainerStore2 = _interopRequireDefault(_ContainerStore);

var _MetricsUtil = require("../utils/MetricsUtil");

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _DockerUtil = require("../utils/DockerUtil");

var _DockerUtil2 = _interopRequireDefault(_DockerUtil);

var _Util = require("../utils/Util");

var _reactBootstrap = require("react-bootstrap");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContainerSettingsPorts = _addons2.default.createClass({
  displayName: "ContainerSettingsPorts",

  contextTypes: {
    router: _addons2.default.PropTypes.func
  },
  getInitialState: function getInitialState() {
    var ports = _ContainerUtil2.default.ports(this.props.container);
    var initialPorts = this.props.container.InitialPorts;
    ports[""] = {
      ip: _DockerUtil2.default.host,
      url: "",
      port: "",
      portType: "tcp",
      error: null
    };
    return {
      ports: ports,
      initialPorts: initialPorts,
      hostname: this.props.container.Config.Hostname
    };
  },
  handleViewLink: function handleViewLink(url) {
    _MetricsUtil2.default.track("Opened In Browser", {
      from: "settings"
    });
    _electron.shell.openExternal("http://" + url);
  },
  createEmptyPort: function createEmptyPort(ports) {
    ports[""] = {
      ip: _DockerUtil2.default.host,
      url: "",
      port: "",
      portType: "tcp"
    };
    document.getElementById("portKey").value = "";
    document.getElementById("portValue").value = "";
  },
  addPort: function addPort() {
    if (document.getElementById("portKey") !== null) {
      var portKey = document.getElementById("portKey").value;
      var portValue = document.getElementById("portValue").value;
      var portTypeValue = document.getElementById("portType").textContent;
      var ports = this.state.ports;
      if (portKey !== "") {
        ports[portKey] = {
          ip: _DockerUtil2.default.host,
          url: _DockerUtil2.default.host + ":" + portValue,
          port: portValue,
          portType: portTypeValue.trim(),
          error: null
        };

        this.checkPort(ports, portKey, portKey);
        if (ports[portKey].error === null) {
          this.createEmptyPort(ports);
        }
      }
    }
    return ports;
  },
  handleAddPort: function handleAddPort(e) {
    var ports = this.addPort();
    this.setState({ ports: ports });
    _MetricsUtil2.default.track("Added Pending Port");
  },
  checkPort: function checkPort(ports, port, key) {
    var _this = this;

    // basic validation, if number is integer, if its in range, if there
    // is no collision with ports of other containers and also if there is no
    // collision with ports for current container
    var otherContainers = _underscore2.default.filter(_underscore2.default.values(_ContainerStore2.default.getState().containers), function (c) {
      return c.Name !== _this.props.container.Name;
    });
    var otherPorts = _underscore2.default.flatten(otherContainers.map(function (container) {
      try {
        return _underscore2.default.values(container.NetworkSettings.Ports).map(function (hosts) {
          return hosts.map(function (host) {
            return { port: host.HostPort, name: container.Name };
          });
        });
      } catch (err) {}
    })).reduce(function (prev, pair) {
      try {
        prev[pair.port] = pair.name;
      } catch (err) {}
      return prev;
    }, {});

    var duplicates = _underscore2.default.filter(ports, function (v, i) {
      return i !== key && _underscore2.default.isEqual(v.port, port);
    });

    if (!port.match(/^[0-9]+$/g)) {
      ports[key].error = "Needs to be an integer.";
    } else if (port <= 0 || port > 65535) {
      ports[key].error = "Needs to be in range <1,65535>.";
    } else if (otherPorts[port]) {
      ports[key].error = 'Collision with container "' + otherPorts[port] + '"';
    } else if (duplicates.length > 0) {
      ports[key].error = "Collision with another port in this container.";
    } else if (port === 22 || port === 2376) {
      ports[key].error = "Ports 22 and 2376 are reserved ports for Docker GUI/Docker.";
    }
  },
  handleChangePort: function handleChangePort(key, e) {
    var ports = this.state.ports;
    var port = e.target.value;
    // save updated port
    ports[key] = _underscore2.default.extend(ports[key], {
      url: ports[key].ip + ":" + port,
      port: port,
      error: null
    });
    this.checkPort(ports, port, key);

    this.setState({ ports: ports });
  },
  handleChangePortKey: function handleChangePortKey(key, e) {
    var ports = this.state.ports;
    var portKey = e.target.value;

    // save updated port
    var currentPort = ports[key];

    delete ports[key];
    ports[portKey] = currentPort;

    this.setState({ ports: ports });
  },
  handleRemovePort: function handleRemovePort(key, e) {
    var ports = this.state.ports;
    delete ports[key];
    this.setState({ ports: ports });
  },
  handleChangePortType: function handleChangePortType(key, portType) {
    var ports = this.state.ports;
    var port = ports[key].port;

    // save updated port
    ports[key] = _underscore2.default.extend(ports[key], {
      url: ports[key].ip + ":" + port,
      port: port,
      portType: portType,
      error: null
    });
    this.setState({ ports: ports });
  },
  isInitialPort: function isInitialPort(key, ports) {
    for (var idx in ports) {
      if (ports.hasOwnProperty(idx)) {
        var p = idx.split("/");
        if (p.length > 0) {
          if (p[0] === key) {
            return true;
          }
        }
      }
    }
    return false;
  },
  handleChangeHostnameEnabled: function handleChangeHostnameEnabled(e) {
    var value = e.target.value;
    this.setState({
      hostname: value
    });
  },
  handleSave: function handleSave() {
    var ports = this.state.ports;
    ports = this.addPort();
    this.setState({ ports: ports });
    var exposedPorts = {};
    var portBindings = _underscore2.default.reduce(ports, function (res, value, key) {
      if (key !== "") {
        res[key + "/" + value.portType] = [{
          HostPort: value.port
        }];
        exposedPorts[key + "/" + value.portType] = {};
      }
      return res;
    }, {});

    var hostConfig = _underscore2.default.extend(this.props.container.HostConfig, {
      PortBindings: portBindings,
      Hostname: this.state.hostname
    });
    var config = _underscore2.default.extend(this.props.container.Config, {
      Hostname: this.state.hostname
    });
    _ContainerActions2.default.update(this.props.container.Name, {
      ExposedPorts: exposedPorts,
      HostConfig: hostConfig,
      Config: config
    });
  },
  render: function render() {
    var _this2 = this;

    if (!this.props.container) {
      return false;
    }
    var isUpdating = this.props.container.State.Updating;
    var isValid = true;

    var ports = _underscore2.default.map(_underscore2.default.pairs(this.state.ports), function (pair) {
      var key = pair[0];
      var _pair$ = pair[1],
          ip = _pair$.ip,
          port = _pair$.port,
          url = _pair$.url,
          portType = _pair$.portType,
          error = _pair$.error;

      isValid = error ? false : isValid;
      var ipLink = _this2.props.container.State.Running && !_this2.props.container.State.Paused && !_this2.props.container.State.ExitCode && !_this2.props.container.State.Restarting ? _addons2.default.createElement(
        "a",
        { onClick: _this2.handleViewLink.bind(_this2, url) },
        ip
      ) : { ip: ip };
      var icon = "";
      var portKey = "";
      var portValue = "";
      if (key === "") {
        icon = _addons2.default.createElement(
          "td",
          null,
          _addons2.default.createElement(
            "a",
            {
              disabled: isUpdating,
              onClick: _this2.handleAddPort,
              className: "only-icon btn btn-positive small"
            },
            _addons2.default.createElement("span", { className: "icon icon-add" })
          )
        );
        portKey = _addons2.default.createElement("input", {
          id: "portKey" + key,
          type: "text",
          disabled: isUpdating,
          defaultValue: key
        });
        portValue = _addons2.default.createElement("input", {
          id: "portValue" + key,
          type: "text",
          disabled: isUpdating,
          defaultValue: port
        });
      } else {
        if (_this2.isInitialPort(key, _this2.state.initialPorts)) {
          icon = _addons2.default.createElement("td", null);
        } else {
          icon = _addons2.default.createElement(
            "td",
            null,
            _addons2.default.createElement(
              "a",
              {
                disabled: isUpdating,
                onClick: _this2.handleRemovePort.bind(_this2, key),
                className: "only-icon btn btn-action small"
              },
              _addons2.default.createElement("span", { className: "icon icon-delete" })
            )
          );
        }
        portKey = _addons2.default.createElement("input", {
          id: "portKey" + key,
          type: "text",
          onChange: _this2.handleChangePortKey.bind(_this2, key),
          disabled: isUpdating,
          defaultValue: key
        });
        portValue = _addons2.default.createElement("input", {
          id: "portValue" + key,
          type: "text",
          onChange: _this2.handleChangePort.bind(_this2, key),
          disabled: isUpdating,
          defaultValue: port
        });
      }
      return _addons2.default.createElement(
        "tr",
        { key: key },
        _addons2.default.createElement(
          "td",
          null,
          portKey
        ),
        _addons2.default.createElement(
          "td",
          { className: "bind" },
          ipLink,
          ":",
          portValue
        ),
        _addons2.default.createElement(
          "td",
          null,
          _addons2.default.createElement(
            _reactBootstrap.DropdownButton,
            {
              disabled: isUpdating,
              id: "portType" + key,
              bsStyle: "primary",
              title: portType
            },
            _addons2.default.createElement(
              _reactBootstrap.MenuItem,
              {
                onSelect: _this2.handleChangePortType.bind(_this2, key, "tcp"),
                key: key + "-tcp"
              },
              "TCP"
            ),
            _addons2.default.createElement(
              _reactBootstrap.MenuItem,
              {
                onSelect: _this2.handleChangePortType.bind(_this2, key, "udp"),
                key: key + "-udp"
              },
              "UDP"
            )
          )
        ),
        icon,
        _addons2.default.createElement(
          "td",
          { className: "error" },
          error
        )
      );
    });
    return _addons2.default.createElement(
      "div",
      { className: "settings-panel" },
      _addons2.default.createElement(
        "div",
        { className: "settings-section" },
        _addons2.default.createElement(
          "h3",
          null,
          "Configure Hostname"
        ),
        _addons2.default.createElement(
          "div",
          { className: "container-info-row" },
          _addons2.default.createElement(
            "div",
            { className: "label-hostname" },
            "HOSTNAME"
          ),
          _addons2.default.createElement("input", {
            id: "hostname",
            className: "line",
            type: "text",
            disabled: isUpdating,
            value: this.state.hostname,
            onChange: this.handleChangeHostnameEnabled
          })
        )
      ),
      _addons2.default.createElement(
        "div",
        { className: "settings-section" },
        _addons2.default.createElement(
          "h3",
          null,
          "Configure Ports"
        ),
        _addons2.default.createElement(
          "table",
          { className: "table ports" },
          _addons2.default.createElement(
            "thead",
            null,
            _addons2.default.createElement(
              "tr",
              null,
              _addons2.default.createElement(
                "th",
                null,
                "DOCKER PORT"
              ),
              _addons2.default.createElement(
                "th",
                null,
                "PUBLISHED IP:PORT"
              ),
              _addons2.default.createElement("th", null)
            )
          ),
          _addons2.default.createElement(
            "tbody",
            null,
            ports
          )
        ),
        _addons2.default.createElement(
          "a",
          {
            className: "btn btn-action",
            disabled: isUpdating || !isValid,
            onClick: this.handleSave
          },
          "Save"
        )
      )
    );
  }
});

module.exports = ContainerSettingsPorts;
