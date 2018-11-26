'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _DockerUtil = require('../utils/DockerUtil');

var _DockerUtil2 = _interopRequireDefault(_DockerUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ContainerUtil = {
  env: function env(container) {
    if (!container || !container.Config || !container.Config.Env) {
      return [];
    }
    return _underscore2.default.map(container.Config.Env, function (env) {
      var i = env.indexOf('=');
      var splits = [env.slice(0, i), env.slice(i + 1)];
      return splits;
    });
  },

  // Provide Foreground options
  mode: function mode(container) {
    return [container && container.Config ? container.Config.Tty : true, container && container.Config ? container.Config.OpenStdin : true, container && container.HostConfig ? container.HostConfig.Privileged : false, container && container.HostConfig ? container.HostConfig.RestartPolicy : { MaximumRetryCount: 0, Name: 'no' }];
  },

  // TODO: inject host here instead of requiring Docker
  ports: function ports(container) {
    if (!container || !container.NetworkSettings) {
      return {};
    }
    var res = {};
    var ip = _DockerUtil2.default.host;
    var ports = container.NetworkSettings.Ports ? container.NetworkSettings.Ports : container.HostConfig.PortBindings ? container.HostConfig.PortBindings : container.Config.ExposedPorts;
    _underscore2.default.each(ports, function (value, key) {
      var _key$split = key.split('/'),
          _key$split2 = (0, _slicedToArray3.default)(_key$split, 2),
          dockerPort = _key$split2[0],
          portType = _key$split2[1];

      var localUrl = null;
      var port = null;
      if (value && value.length) {
        port = value[0].HostPort;
      }
      localUrl = port ? ip + ':' + port : ip + ':' + '<not set>';

      res[dockerPort] = {
        url: localUrl,
        ip: ip,
        port: port,
        portType: portType
      };
    });
    return res;
  },

  links: function links(container) {
    if (!container || !container.HostConfig || !container.HostConfig.Links) {
      return [];
    }

    var res = _underscore2.default.map(container.HostConfig.Links, function (link, key) {
      return {
        "container": link.split(":")[0].split("/")[1],
        "alias": link.split(":")[1].split("/")[2]
      };
    });

    return res;
  },

  normalizeLinksPath: function normalizeLinksPath(container, links) {
    var res = _underscore2.default.map(links, function (link) {
      return "/" + link.container + ":/" + container.Name + "/" + link.alias;
    });

    return res;
  }

};

module.exports = ContainerUtil;
