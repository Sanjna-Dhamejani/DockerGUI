'use strict';

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _dockerode = require('dockerode');

var _dockerode2 = _interopRequireDefault(_dockerode);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _Util = require('./Util');

var _Util2 = _interopRequireDefault(_Util);

var _HubUtil = require('./HubUtil');

var _HubUtil2 = _interopRequireDefault(_HubUtil);

var _MetricsUtil = require('../utils/MetricsUtil');

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _ContainerServerActions = require('../actions/ContainerServerActions');

var _ContainerServerActions2 = _interopRequireDefault(_ContainerServerActions);

var _ImageServerActions = require('../actions/ImageServerActions');

var _ImageServerActions2 = _interopRequireDefault(_ImageServerActions);

var _NetworkActions = require('../actions/NetworkActions');

var _NetworkActions2 = _interopRequireDefault(_NetworkActions);

var _NetworkStore = require('../stores/NetworkStore');

var _NetworkStore2 = _interopRequireDefault(_NetworkStore);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _stream = require('stream');

var _stream2 = _interopRequireDefault(_stream);

var _JSONStream = require('JSONStream');

var _JSONStream2 = _interopRequireDefault(_JSONStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DockerUtil = {
  host: null,
  client: null,
  placeholders: {},
  stream: null,
  eventStream: null,
  activeContainerName: null,
  localImages: null,
  imagesUsed: [],

  setup: function setup(ip, name) {
    if (!ip && !name) {
      throw new Error('Falsy ip or name passed to docker client setup');
    }
    this.host = ip;

    if (ip.indexOf('local') !== -1) {
      try {
        if (_Util2.default.isWindows()) {
          this.client = new _dockerode2.default({ socketPath: '//./pipe/docker_engine' });
        } else {
          this.client = new _dockerode2.default({ socketPath: '/var/run/docker.sock' });
        }
      } catch (error) {
        throw new Error('Cannot connect to the Docker daemon. Is the daemon running?');
      }
    } else {
      var certDir = process.env.DOCKER_CERT_PATH || _path2.default.join(_Util2.default.home(), '.docker/machine/machines/', name);
      if (!_fs2.default.existsSync(certDir)) {
        throw new Error('Certificate directory does not exist');
      }

      this.client = new _dockerode2.default({
        protocol: 'https',
        host: ip,
        port: 2376,
        ca: _fs2.default.readFileSync(_path2.default.join(certDir, 'ca.pem')),
        cert: _fs2.default.readFileSync(_path2.default.join(certDir, 'cert.pem')),
        key: _fs2.default.readFileSync(_path2.default.join(certDir, 'key.pem'))
      });
    }
  },
  version: function version() {
    var _this = this;

    return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
      var version, maxRetries, retries, error_message;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              version = null;
              maxRetries = 10;
              retries = 0;
              error_message = "";

            case 4:
              if (!(version == null && retries < maxRetries)) {
                _context.next = 10;
                break;
              }

              _this.client.version(function (error, data) {
                if (!error) {
                  version = data.Version;
                } else {
                  error_message = error;
                }
                retries++;
              });
              _context.next = 8;
              return _bluebird2.default.delay(500);

            case 8:
              _context.next = 4;
              break;

            case 10:
              if (!(version == null)) {
                _context.next = 12;
                break;
              }

              throw new Error(error_message);

            case 12:
              return _context.abrupt('return', version);

            case 13:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }))();
  },
  init: function init() {
    var _this2 = this;

    this.placeholders = JSON.parse(localStorage.getItem('placeholders')) || {};
    this.refresh();
    this.listen();
    this.fetchAllNetworks();

    // Resume pulling containers that were previously being pulled
    _underscore2.default.each(_underscore2.default.values(this.placeholders), function (container) {
      _ContainerServerActions2.default.added({ container: container });

      _this2.client.pull(container.Config.Image, function (error, stream) {
        if (error) {
          _ContainerServerActions2.default.error({ name: container.Name, error: error });
          return;
        }

        stream.setEncoding('utf8');
        stream.on('data', function () {});
        stream.on('end', function () {
          if (!_this2.placeholders[container.Name]) {
            return;
          }

          delete _this2.placeholders[container.Name];
          localStorage.setItem('placeholders', (0, _stringify2.default)(_this2.placeholders));
          _this2.createContainer(container.Name, { Image: container.Config.Image });
        });
      });
    });
  },
  isDockerRunning: function isDockerRunning() {
    try {
      _child_process2.default.execSync('ps ax | grep "docker daemon" | grep -v grep');
    } catch (error) {
      throw new Error('Cannot connect to the Docker daemon. The daemon is not running.');
    }
  },
  startContainer: function startContainer(name) {
    var _this3 = this;

    var container = this.client.getContainer(name);

    container.start(function (error) {
      if (error) {
        _ContainerServerActions2.default.error({ name: name, error: error });
        console.log('error starting: %o - %o', name, error);
        return;
      }
      _ContainerServerActions2.default.started({ name: name, error: error });
      _this3.fetchContainer(name);
    });
  },
  createContainer: function createContainer(name, containerData) {
    var _this4 = this;

    containerData.name = containerData.Name || name;

    if (containerData.Config && containerData.Config.Image) {
      containerData.Image = containerData.Config.Image;
    }

    if (containerData.Config && containerData.Config.Hostname) {
      containerData.Hostname = containerData.Config.Hostname;
    }

    if (!containerData.Env && containerData.Config && containerData.Config.Env) {
      containerData.Env = containerData.Config.Env;
    }

    containerData.Volumes = _underscore2.default.mapObject(containerData.Volumes, function () {});

    this.client.getImage(containerData.Image).inspect(function (error, image) {
      if (error) {
        _ContainerServerActions2.default.error({ name: name, error: error });
        return;
      }

      if (!containerData.HostConfig || containerData.HostConfig && !containerData.HostConfig.PortBindings) {
        if (!containerData.HostConfig) {
          containerData.HostConfig = {};
        }
        containerData.HostConfig.PublishAllPorts = true;
      }

      var networks = [];
      if (!_underscore2.default.has(containerData, 'NetworkingConfig') && _underscore2.default.has(containerData.NetworkSettings, 'Networks')) {
        var EndpointsConfig = {};
        networks = _underscore2.default.keys(containerData.NetworkSettings.Networks);
        if (networks.length) {
          var networkName = networks.shift();
          EndpointsConfig[networkName] = _underscore2.default.extend(containerData.NetworkSettings.Networks[networkName], { Aliases: [] });
        }
        containerData.NetworkingConfig = {
          EndpointsConfig: EndpointsConfig
        };
      }

      if (image.Config.Cmd) {
        containerData.Cmd = image.Config.Cmd;
      } else if (!image.Config.Entrypoint) {
        containerData.Cmd = 'sh';
      }

      // Keep current config for new container if no changes
      _underscore2.default.extend(containerData, _underscore2.default.omit(containerData.Config, (0, _keys2.default)(containerData)));

      var existing = _this4.client.getContainer(name);
      existing.kill(function () {
        existing.remove(function () {
          _this4.client.createContainer(containerData, function (error) {
            if (error) {
              console.error(err);
              _ContainerServerActions2.default.error({ name: name, error: error });
              return;
            }
            _MetricsUtil2.default.track('Container Finished Creating');
            _this4.addOrRemoveNetworks(name, networks, true).finally(function () {
              _this4.startContainer(name);
              delete _this4.placeholders[name];
              localStorage.setItem('placeholders', (0, _stringify2.default)(_this4.placeholders));
              _this4.refresh();
            });
          });
        });
      });
    });
  },
  fetchContainer: function fetchContainer(id) {
    var _this5 = this;

    this.client.getContainer(id).inspect(function (error, container) {
      if (error) {
        _ContainerServerActions2.default.error({ name: id, error: error });
      } else {
        container.Name = container.Name.replace('/', '');
        _this5.client.getImage(container.Image).inspect(function (error, image) {
          if (error) {
            _ContainerServerActions2.default.error({ name: name, error: error });
            return;
          }
          container.InitialPorts = image.Config.ExposedPorts;
        });

        _ContainerServerActions2.default.updated({ container: container });
        _NetworkActions2.default.clearPending();
      }
    });
  },
  fetchAllContainers: function fetchAllContainers() {
    var _this6 = this;

    this.client.listContainers({ all: true }, function (err, containers) {
      if (err) {
        console.error(err);
        return;
      }
      _this6.imagesUsed = [];
      _async2.default.map(containers, function (container, callback) {
        _this6.client.getContainer(container.Id).inspect(function (error, container) {
          if (error) {
            callback(null, null);
            return;
          }
          var imgSha = container.Image.replace('sha256:', '');
          if (_underscore2.default.indexOf(_this6.imagesUsed, imgSha) === -1) {
            _this6.imagesUsed.push(imgSha);
          }
          container.Name = container.Name.replace('/', '');
          _this6.client.getImage(container.Image).inspect(function (error, image) {
            if (error) {
              _ContainerServerActions2.default.error({ name: name, error: error });
              return;
            }
            container.InitialPorts = image.Config.ExposedPorts;
          });
          callback(null, container);
        });
      }, function (err, containers) {
        containers = containers.filter(function (c) {
          return c !== null;
        });
        if (err) {
          // TODO: add a global error handler for this
          console.error(err);
          return;
        }
        _ContainerServerActions2.default.allUpdated({ containers: _underscore2.default.indexBy(containers.concat(_underscore2.default.values(_this6.placeholders)), 'Name') });
        var favorites = JSON.parse(localStorage.getItem('containers.favorites')) || [];
        favorites.forEach(function (name) {
          return _ContainerServerActions2.default.toggleFavorite({ name: name });
        });
        _this6.logs();
        _this6.fetchAllImages();
      });
    });
  },
  fetchAllImages: function fetchAllImages() {
    var _this7 = this;

    this.client.listImages(function (err, list) {
      if (err) {
        _ImageServerActions2.default.error(err);
      } else {
        list.map(function (image, idx) {
          var imgSha = image.Id.replace('sha256:', '');
          if (_underscore2.default.indexOf(_this7.imagesUsed, imgSha) !== -1) {
            list[idx].inUse = true;
          } else {
            list[idx].inUse = false;
          }
          var imageSplit = '';
          if (image.RepoTags) {
            imageSplit = image.RepoTags[0].split(':');
          } else {
            imageSplit = image.RepoDigests[0].split('@');
          }
          var repo = imageSplit[0];
          if (imageSplit.length > 2) {
            repo = imageSplit[0] + ':' + imageSplit[1];
          }
          if (repo.indexOf('/') === -1) {
            repo = 'local/' + repo;
          }

          var _repo$split = repo.split('/');

          var _repo$split2 = (0, _slicedToArray3.default)(_repo$split, 2);

          list[idx].namespace = _repo$split2[0];
          list[idx].name = _repo$split2[1];
        });
        _this7.localImages = list;
        _ImageServerActions2.default.updated(list);
      }
    });
  },
  fetchAllNetworks: function fetchAllNetworks() {
    this.client.listNetworks(function (err, networks) {
      if (err) {
        _NetworkActions2.default.error(err);
      } else {
        networks = networks.sort(function (n1, n2) {
          if (n1.Name > n2.Name) {
            return 1;
          }
          if (n1.Name < n2.Name) {
            return -1;
          }
          return 0;
        });
        _NetworkActions2.default.updated(networks);
      }
    });
  },
  updateContainerNetworks: function updateContainerNetworks(name, connectedNetworks, disconnectedNetworks) {
    var _this8 = this;

    _NetworkActions2.default.pending();
    var disconnectedPromise = this.addOrRemoveNetworks(name, disconnectedNetworks, false);

    disconnectedPromise.then(function () {
      var connectedPromise = _this8.addOrRemoveNetworks(name, connectedNetworks, true);
      connectedPromise.finally(function () {
        _this8.fetchContainer(name);
      });
    }).catch(function () {
      _this8.fetchContainer(name);
    });
  },
  addOrRemoveNetworks: function addOrRemoveNetworks(name, networks, connect) {
    var _this9 = this;

    var promises = _underscore2.default.map(networks, function (networkName) {
      var network = _this9.client.getNetwork(networkName);
      var operation = (connect === true ? network.connect : network.disconnect).bind(network);

      return new _bluebird2.default(function (resolve, reject) {
        operation({
          Container: name
        }, function (err, data) {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    });

    return _bluebird2.default.all(promises);
  },
  removeImage: function removeImage(selectedRepoTag) {
    var _this10 = this;

    // Prune all dangling image first
    this.localImages.some(function (image) {
      if (image.namespace == "<none>" && image.name == "<none>") {
        return false;
      }
      if (image.RepoTags) {
        image.RepoTags.map(function (repoTag) {
          if (repoTag === selectedRepoTag) {
            _this10.client.getImage(selectedRepoTag).remove({ 'force': true }, function (err, data) {
              if (err) {
                console.error(err);
                _ImageServerActions2.default.error(err);
              } else {
                _ImageServerActions2.default.destroyed(data);
                _this10.refresh();
              }
            });
            return true;
          }
        });
      }
    });
  },
  run: function run(name, repository, tag, network) {
    var _this11 = this;

    var local = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    tag = tag || 'latest';
    var imageName = repository + ':' + tag;

    var placeholderData = {
      Id: _Util2.default.randomId(),
      Name: name,
      Image: imageName,
      Config: {
        Image: imageName
      },
      Tty: true,
      OpenStdin: true,
      State: {
        Downloading: true
      }
    };
    _ContainerServerActions2.default.added({ container: placeholderData });

    this.placeholders[name] = placeholderData;
    localStorage.setItem('placeholders', (0, _stringify2.default)(this.placeholders));
    var containerData = {
      Image: imageName,
      Tty: true,
      OpenStdin: true,
      NetworkingConfig: {
        EndpointsConfig: (0, _defineProperty3.default)({}, network, {})
      }
    };
    if (local) {
      this.createContainer(name, containerData);
    } else {
      this.pullImage(repository, tag, function (error) {
        if (error) {
          _ContainerServerActions2.default.error({ name: name, error: error });
          _this11.refresh();
          return;
        }

        if (!_this11.placeholders[name]) {
          return;
        }

        _this11.createContainer(name, containerData);
      },

      // progress is actually the progression PER LAYER (combined in columns)
      // not total because it's not accurate enough
      function (progress) {
        _ContainerServerActions2.default.progress({ name: name, progress: progress });
      }, function () {
        _ContainerServerActions2.default.waiting({ name: name, waiting: true });
      });
    }
  },
  updateContainer: function updateContainer(name, data) {
    var _this12 = this;

    var existing = this.client.getContainer(name);
    existing.inspect(function (error, existingData) {
      if (error) {
        _ContainerServerActions2.default.error({ name: name, error: error });
        _this12.refresh();
        return;
      }

      if (existingData.Config && existingData.Config.Image) {
        existingData.Image = existingData.Config.Image;
      }

      if (!existingData.Env && existingData.Config && existingData.Config.Env) {
        existingData.Env = existingData.Config.Env;
      }

      if ((!existingData.Tty || !existingData.OpenStdin) && existingData.Config && (existingData.Config.Tty || existingData.Config.OpenStdin)) {
        existingData.Tty = existingData.Config.Tty;
        existingData.OpenStdin = existingData.Config.OpenStdin;
      }

      data.Mounts = data.Mounts || existingData.Mounts;

      var fullData = _underscore2.default.extend(existingData, data);
      _this12.createContainer(name, fullData);
    });
  },
  rename: function rename(name, newName) {
    var _this13 = this;

    this.client.getContainer(name).rename({ name: newName }, function (error) {
      if (error && error.statusCode !== 204) {
        _ContainerServerActions2.default.error({ name: name, error: error });
        return;
      }
      var oldPath = _Util2.default.windowsToLinuxPath(_path2.default.join(_Util2.default.home(), _Util2.default.documents(), 'Kitematic', name));
      var newPath = _Util2.default.windowsToLinuxPath(_path2.default.join(_Util2.default.home(), _Util2.default.documents(), 'Kitematic', newName));

      _this13.client.getContainer(newName).inspect(function (error, container) {
        if (error) {
          // TODO: handle error
          _ContainerServerActions2.default.error({ newName: newName, error: error });
          _this13.refresh();
        }
        (0, _rimraf2.default)(newPath, function () {
          if (_fs2.default.existsSync(oldPath)) {
            _fs2.default.renameSync(oldPath, newPath);
          }

          container.Mounts.forEach(function (m) {
            m.Source = m.Source.replace(oldPath, newPath);
          });

          _this13.updateContainer(newName, { Mounts: container.Mounts });
          (0, _rimraf2.default)(oldPath, function () {});
        });
      });
    });
  },
  restart: function restart(name) {
    var _this14 = this;

    this.client.getContainer(name).stop({ t: 5 }, function (stopError) {
      if (stopError && stopError.statusCode !== 304) {
        _ContainerServerActions2.default.error({ name: name, stopError: stopError });
        _this14.refresh();
        return;
      }
      _this14.client.getContainer(name).start(function (startError) {
        if (startError && startError.statusCode !== 304) {
          _ContainerServerActions2.default.error({ name: name, startError: startError });
          _this14.refresh();
          return;
        }
        _this14.fetchContainer(name);
      });
    });
  },
  stop: function stop(name) {
    var _this15 = this;

    this.client.getContainer(name).stop({ t: 5 }, function (error) {
      if (error && error.statusCode !== 304) {
        _ContainerServerActions2.default.error({ name: name, error: error });
        _this15.refresh();
        return;
      }
      _this15.fetchContainer(name);
    });
  },
  start: function start(name, callback) {
    var _this17 = this;

    var self = this;
    this.client.getContainer(name).inspect(function (error, container) {
      if (error) {
        _ContainerServerActions2.default.error({ name: name, error: error });
        if (callback) callback(error);
      } else {
        if (container.HostConfig && container.HostConfig.Links && container.HostConfig.Links.length > 0 && localStorage.getItem('settings.startLinkedContainers') === 'true') {
          self.startLinkedContainers(name, function (error) {
            var _this16 = this;

            if (error) {
              _ContainerServerActions2.default.error({ name: name, error: error });
              if (callback) callback(error);
            } else {
              self.client.getContainer(name).start(function (error) {
                if (error && error.statusCode !== 304) {
                  _ContainerServerActions2.default.error({ name: name, error: error });
                  _this16.refresh();
                  return;
                } else {
                  self.fetchContainer(name);
                  if (callback) callback(null);
                }
              });
            }
          });
        } else {
          self.client.getContainer(name).start(function (error) {
            if (error && error.statusCode !== 304) {
              _ContainerServerActions2.default.error({ name: name, error: error });
              _this17.refresh();
              return;
            } else {
              self.fetchContainer(name);
              if (callback) callback(null);
            }
          });
        }
      }
    });
  },
  startLinkedContainers: function startLinkedContainers(name, callback) {
    var self = this;

    this.client.getContainer(name).inspect(function (error, container) {
      if (error) {
        _ContainerServerActions2.default.error({ name: name, error: error });
        if (callback) callback(error);
      } else {
        var links = _underscore2.default.map(container.HostConfig.Links, function (link, key) {
          return link.split(":")[0].split("/")[1];
        });

        _async2.default.map(links, function (link, cb) {
          var linkedContainer = self.client.getContainer(link);
          if (linkedContainer) {
            linkedContainer.inspect(function (error, linkedContainerInfo) {
              if (error) {
                _ContainerServerActions2.default.error({ name: name, error: error });
                cb(error);
              } else {
                if (linkedContainerInfo.State.Stopping || linkedContainerInfo.State.Downloading || linkedContainerInfo.State.ExitCode || !linkedContainerInfo.State.Running || linkedContainerInfo.State.Updating) {
                  self.start(linkedContainerInfo.Id, function (error) {
                    if (error) {
                      _ContainerServerActions2.default.error({ name: name, error: error });
                      cb(error);
                    } else {
                      self.fetchContainer(linkedContainerInfo.Id);
                      cb(null);
                    }
                  });
                } else {
                  cb(null);
                }
              }
            });
          } else {
            cb("linked container " + link + " not found");
          }
        }, function (error, containers) {
          if (error) {
            _ContainerServerActions2.default.error({ name: name, error: error });
            if (callback) callback(error);
            return;
          } else {
            if (callback) callback(null);
            return;
          }
        });
      }
    });
  },
  destroy: function destroy(name) {
    var _this18 = this;

    if (this.placeholders[name]) {
      _ContainerServerActions2.default.destroyed({ id: name });
      delete this.placeholders[name];
      localStorage.setItem('placeholders', (0, _stringify2.default)(this.placeholders));
      this.refresh();
      return;
    }

    var container = this.client.getContainer(name);
    container.unpause(function () {
      container.kill(function () {
        container.remove(function (error) {
          if (error) {
            _ContainerServerActions2.default.error({ name: name, error: error });
            _this18.refresh();
            return;
          }
          _ContainerServerActions2.default.destroyed({ id: name });
          var volumePath = _path2.default.join(_Util2.default.home(), 'Kitematic', name);
          if (_fs2.default.existsSync(volumePath)) {
            (0, _rimraf2.default)(volumePath, function () {});
          }
          _this18.refresh();
        });
      });
    });
  },
  active: function active(name) {
    this.detachLog();
    this.activeContainerName = name;

    if (name) {
      this.logs();
    }
  },
  logs: function logs() {
    var _this19 = this;

    if (!this.activeContainerName) {
      return;
    }

    this.client.getContainer(this.activeContainerName).logs({
      stdout: true,
      stderr: true,
      tail: 1000,
      follow: false,
      timestamps: 1
    }, function (err, logStream) {
      if (err) {
        // socket hang up can be captured
        console.error(err);
        _ContainerServerActions2.default.error({ name: _this19.activeContainerName, err: err });
        return;
      }

      var logs = '';
      logStream.setEncoding('utf8');
      logStream.on('data', function (chunk) {
        return logs += chunk;
      });
      logStream.on('end', function () {
        _ContainerServerActions2.default.logs({ name: _this19.activeContainerName, logs: logs });
        _this19.attach();
      });
    });
  },
  attach: function attach() {
    var _this20 = this;

    if (!this.activeContainerName) {
      return;
    }

    this.client.getContainer(this.activeContainerName).logs({
      stdout: true,
      stderr: true,
      tail: 0,
      follow: true,
      timestamps: 1
    }, function (err, logStream) {
      if (err) {
        // Socket hang up also can be found here
        console.error(err);
        return;
      }

      _this20.detachLog();
      _this20.stream = logStream;

      var timeout = null;
      var batch = '';
      logStream.setEncoding('utf8');
      logStream.on('data', function (chunk) {
        batch += chunk;
        if (!timeout) {
          timeout = setTimeout(function () {
            _ContainerServerActions2.default.log({ name: _this20.activeContainerName, entry: batch });
            timeout = null;
            batch = '';
          }, 16);
        }
      });
    });
  },
  detachLog: function detachLog() {
    if (this.stream) {
      this.stream.destroy();
      this.stream = null;
    }
  },
  detachEvent: function detachEvent() {
    if (this.eventStream) {
      this.eventStream.destroy();
      this.eventStream = null;
    }
  },
  listen: function listen() {
    var _this21 = this;

    this.detachEvent();
    this.client.getEvents(function (error, stream) {
      if (error || !stream) {
        // TODO: Add app-wide error handler
        return;
      }
      // TODO: Add health-check for existing connection

      stream.setEncoding('utf8');
      stream.on('data', function (json) {
        var data = JSON.parse(json);

        if (['pull', 'untag', 'tag', 'delete', 'attach'].includes(data.status)) {
          _this21.refresh();
        }

        if (data.status === 'destroy') {
          _ContainerServerActions2.default.destroyed({ id: data.id });
          _this21.detachLog();
        } else if (data.status === 'kill') {
          _ContainerServerActions2.default.kill({ id: data.id });
          _this21.detachLog();
        } else if (data.status === 'stop') {
          _ContainerServerActions2.default.stopped({ id: data.id });
          _this21.detachLog();
        } else if (data.status === 'create') {
          _this21.logs();
          _this21.fetchContainer(data.id);
        } else if (data.status === 'start') {
          _this21.attach();
          _this21.fetchContainer(data.id);
        } else if (data.id) {
          _this21.fetchContainer(data.id);
        }

        if (data.Type === 'network') {
          var action = data.Action;
          if (action === 'connect' || action === 'disconnect') {
            // do not fetch container while networks updating via Kitematic
            if (!_NetworkStore2.default.getState().pending) {
              _this21.fetchContainer(data.Actor.Attributes.container);
            }
          } else if (action === 'create' || action === 'destroy') {
            _this21.fetchAllNetworks();
          }
        }
      });
      _this21.eventStream = stream;
    });
  },
  pullImage: function pullImage(repository, tag, callback, progressCallback, blockedCallback) {
    var opts = {},
        config = _HubUtil2.default.config();
    if (!_HubUtil2.default.config()) {
      opts = {};
    } else {
      var _hubUtil$creds = _HubUtil2.default.creds(config),
          _hubUtil$creds2 = (0, _slicedToArray3.default)(_hubUtil$creds, 2),
          username = _hubUtil$creds2[0],
          password = _hubUtil$creds2[1];

      opts = {
        authconfig: {
          username: username,
          password: password,
          auth: ''
        }
      };
    }

    this.client.pull(repository + ':' + tag, opts, function (err, stream) {
      if (err) {
        console.log('Err: %o', err);
        callback(err);
        return;
      }

      stream.setEncoding('utf8');

      // scheduled to inform about progression at given interval
      var tick = null;
      var layerProgress = {};

      // Split the loading in a few columns for more feedback
      var columns = {};
      columns.amount = 4; // arbitrary
      columns.toFill = 0; // the current column index, waiting for layer IDs to be displayed
      var error = null;

      // data is associated with one layer only (can be identified with id)
      stream.pipe(_JSONStream2.default.parse()).on('data', function (data) {
        if (data.error) {
          error = data.error;
          return;
        }

        if (data.status && (data.status === 'Pulling dependent layers' || data.status.indexOf('already being pulled by another client') !== -1)) {
          blockedCallback();
          return;
        }

        if (data.status === 'Pulling fs layer') {
          layerProgress[data.id] = {
            current: 0,
            total: 1
          };
        } else if (data.status === 'Downloading') {
          if (!columns.progress) {
            columns.progress = []; // layerIDs, nbLayers, maxLayers, progress value
            var layersToLoad = _underscore2.default.keys(layerProgress).length;
            var layersPerColumn = Math.floor(layersToLoad / columns.amount);
            var leftOverLayers = layersToLoad % columns.amount;
            for (var i = 0; i < columns.amount; i++) {
              var layerAmount = layersPerColumn;
              if (i < leftOverLayers) {
                layerAmount += 1;
              }
              columns.progress[i] = { layerIDs: [], nbLayers: 0, maxLayers: layerAmount, value: 0.0 };
            }
          }

          layerProgress[data.id].current = data.progressDetail.current;
          layerProgress[data.id].total = data.progressDetail.total;

          // Assign to a column if not done yet
          if (!layerProgress[data.id].column) {
            // test if we can still add layers to that column
            if (columns.progress[columns.toFill].nbLayers === columns.progress[columns.toFill].maxLayers && columns.toFill < columns.amount - 1) {
              columns.toFill++;
            }

            layerProgress[data.id].column = columns.toFill;
            columns.progress[columns.toFill].layerIDs.push(data.id);
            columns.progress[columns.toFill].nbLayers++;
          }

          if (!tick) {
            tick = setTimeout(function () {
              clearInterval(tick);
              tick = null;
              for (var _i = 0; _i < columns.amount; _i++) {
                columns.progress[_i].value = 0.0;
                if (columns.progress[_i].nbLayers > 0) {
                  var layer = void 0;
                  var totalSum = 0;
                  var currentSum = 0;

                  for (var j = 0; j < columns.progress[_i].nbLayers; j++) {
                    layer = layerProgress[columns.progress[_i].layerIDs[j]];
                    totalSum += layer.total;
                    currentSum += layer.current;
                  }

                  if (totalSum > 0) {
                    columns.progress[_i].value = Math.min(100.0 * currentSum / totalSum, 100);
                  } else {
                    columns.progress[_i].value = 0.0;
                  }
                }
              }
              progressCallback(columns);
            }, 16);
          }
        }
      });
      stream.on('end', function () {
        callback(error);
      });
    });
  },
  refresh: function refresh() {
    this.fetchAllContainers();
  }
};

module.exports = DockerUtil;
