'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _ImageActions = require('../actions/ImageActions');

var _ImageActions2 = _interopRequireDefault(_ImageActions);

var _ImageServerActions = require('../actions/ImageServerActions');

var _ImageServerActions2 = _interopRequireDefault(_ImageServerActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ImageStore = function () {
  function ImageStore() {
    (0, _classCallCheck3.default)(this, ImageStore);

    this.bindActions(_ImageActions2.default);
    this.bindActions(_ImageServerActions2.default);
    this.results = [];
    this.images = [];
    this.imagesLoading = false;
    this.resultsLoading = false;
    this.error = null;
  }

  (0, _createClass3.default)(ImageStore, [{
    key: 'error',
    value: function error(_error) {
      this.setState({ error: _error, imagesLoading: false, resultsLoading: false });
    }
  }, {
    key: 'clearError',
    value: function clearError() {
      this.setState({ error: null });
    }
  }, {
    key: 'destroyed',
    value: function destroyed(data) {
      var images = this.images;
      if (data && data[1] && data[1].Deleted) {
        delete images[data[1].Deleted];
      }
      this.setState({ error: null });
    }
  }, {
    key: 'updated',
    value: function updated(images) {
      var tags = {};
      var finalImages = [];
      images.map(function (image) {
        if (image.RepoTags) {
          image.RepoTags.map(function (repoTags) {
            var _repoTags$split = repoTags.split(':'),
                _repoTags$split2 = (0, _slicedToArray3.default)(_repoTags$split, 2),
                name = _repoTags$split2[0],
                tag = _repoTags$split2[1];

            if (typeof tags[name] !== 'undefined') {
              finalImages[tags[name]].tags.push(tag);
              if (image.inUse) {
                finalImages[tags[name]].inUse = image.inUse;
              }
            } else {
              image.tags = [tag];
              tags[name] = finalImages.length;
              finalImages.push(image);
            }
          });
        }
      });
      this.setState({ error: null, images: finalImages, imagesLoading: false });
    }
  }], [{
    key: 'all',
    value: function all() {
      var state = this.getState();
      return state.images;
    }
  }]);
  return ImageStore;
}();

exports.default = _alt2.default.createStore(ImageStore);
