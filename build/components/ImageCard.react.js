"use strict";

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

var _addons = require("react/addons");

var _addons2 = _interopRequireDefault(_addons);

var _reactRouter = require("react-router");

var _reactRouter2 = _interopRequireDefault(_reactRouter);

var _electron = require("electron");

var _reactRetinaImage = require("react-retina-image");

var _reactRetinaImage2 = _interopRequireDefault(_reactRetinaImage);

var _MetricsUtil = require("../utils/MetricsUtil");

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _ContainerActions = require("../actions/ContainerActions");

var _ContainerActions2 = _interopRequireDefault(_ContainerActions);

var _ImageActions = require("../actions/ImageActions");

var _ImageActions2 = _interopRequireDefault(_ImageActions);

var _ContainerStore = require("../stores/ContainerStore");

var _ContainerStore2 = _interopRequireDefault(_ContainerStore);

var _TagStore = require("../stores/TagStore");

var _TagStore2 = _interopRequireDefault(_TagStore);

var _TagActions = require("../actions/TagActions");

var _TagActions2 = _interopRequireDefault(_TagActions);

var _NetworkActions = require("../actions/NetworkActions");

var _NetworkActions2 = _interopRequireDefault(_NetworkActions);

var _NetworkStore = require("../stores/NetworkStore");

var _NetworkStore2 = _interopRequireDefault(_NetworkStore);

var _numeral = require("numeral");

var _numeral2 = _interopRequireDefault(_numeral);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ImageCard = _addons2.default.createClass({
  displayName: "ImageCard",

  mixins: [_reactRouter2.default.Navigation],
  getInitialState: function getInitialState() {
    return {
      tags: this.props.tags || [],
      chosenTag: this.props.chosenTag || "latest",
      defaultNetwork: this.props.defaultNetwork || "bridge",
      networks: _NetworkStore2.default.all(),
      searchTag: ""
    };
  },
  componentDidMount: function componentDidMount() {
    _TagStore2.default.listen(this.updateTags);
    _NetworkStore2.default.listen(this.updateNetworks);
  },
  componentWillUnmount: function componentWillUnmount() {
    _TagStore2.default.unlisten(this.updateTags);
    _NetworkStore2.default.unlisten(this.updateNetworks);
  },
  updateTags: function updateTags() {
    var repo = this.props.image.namespace + "/" + this.props.image.name;
    var state = _TagStore2.default.getState();
    if (this.state.tags.length && !state.tags[repo]) {
      (0, _jquery2.default)(this.getDOMNode()).find(".tag-overlay").fadeOut(300);
    }
    this.setState({
      loading: _TagStore2.default.getState().loading[repo] || false,
      tags: _TagStore2.default.getState().tags[repo] || []
    });
  },
  updateNetworks: function updateNetworks() {
    this.setState({
      networks: _NetworkStore2.default.all()
    });
  },
  handleTagClick: function handleTagClick(tag) {
    this.setState({
      chosenTag: tag
    });
    var $tagOverlay = (0, _jquery2.default)(this.getDOMNode()).find(".tag-overlay");
    $tagOverlay.fadeOut(300);
    _MetricsUtil2.default.track("Selected Image Tag");
  },
  handleNetworkClick: function handleNetworkClick(network) {
    this.setState({
      defaultNetwork: network
    });
    var $networkOverlay = (0, _jquery2.default)(this.getDOMNode()).find(".network-overlay");
    $networkOverlay.fadeOut(300);
    _MetricsUtil2.default.track("Selected Default Network");
  },
  handleClick: function handleClick() {
    _MetricsUtil2.default.track("Created Container", {
      from: "search",
      private: this.props.image.is_private,
      official: this.props.image.namespace === "library",
      userowned: this.props.image.is_user_repo,
      recommended: this.props.image.is_recommended,
      local: this.props.image.is_local || false
    });
    var name = _ContainerStore2.default.generateName(this.props.image.name);
    var localImage = this.props.image.is_local || false;
    var repo = this.props.image.namespace === "library" || this.props.image.namespace === "local" ? this.props.image.name : this.props.image.namespace + "/" + this.props.image.name;

    _ContainerActions2.default.run(name, repo, this.state.chosenTag, this.state.defaultNetwork, localImage);
    this.transitionTo("containerHome", { name: name });
  },
  handleMenuOverlayClick: function handleMenuOverlayClick() {
    var $menuOverlay = (0, _jquery2.default)(this.getDOMNode()).find(".menu-overlay");
    $menuOverlay.fadeIn(300);
  },
  handleCloseMenuOverlay: function handleCloseMenuOverlay() {
    var $menuOverlay = (0, _jquery2.default)(this.getDOMNode()).find(".menu-overlay");
    $menuOverlay.fadeOut(300);
  },
  handleTagOverlayClick: function handleTagOverlayClick() {
    var $tagOverlay = (0, _jquery2.default)(this.getDOMNode()).find(".tag-overlay");
    $tagOverlay.fadeIn(300);
    var localImage = this.props.image.is_local || false;
    if (localImage) {
      _TagActions2.default.localTags(this.props.image.namespace + "/" + this.props.image.name, this.props.tags);
    } else {
      _TagActions2.default.tags(this.props.image.namespace + "/" + this.props.image.name);
    }
    this.focusSearchTagInput();
  },
  handleCloseTagOverlay: function handleCloseTagOverlay() {
    var $menuOverlay = (0, _jquery2.default)(this.getDOMNode()).find(".menu-overlay");
    $menuOverlay.hide();
    var $tagOverlay = (0, _jquery2.default)(this.getDOMNode()).find(".tag-overlay");
    $tagOverlay.fadeOut(300);
  },
  handleNetworkOverlayClick: function handleNetworkOverlayClick() {
    var $networkOverlay = (0, _jquery2.default)(this.getDOMNode()).find(".network-overlay");
    $networkOverlay.fadeIn(300);
  },
  handleCloseNetworkOverlay: function handleCloseNetworkOverlay() {
    var $menuOverlay = (0, _jquery2.default)(this.getDOMNode()).find(".menu-overlay");
    $menuOverlay.hide();
    var $networkOverlay = (0, _jquery2.default)(this.getDOMNode()).find(".network-overlay");
    $networkOverlay.fadeOut(300);
  },
  handleDeleteImgClick: function handleDeleteImgClick(image) {
    if (this.state.chosenTag && !this.props.image.inUse) {
      _ImageActions2.default.destroy(image.RepoTags[0].split(":")[0] + ":" + this.state.chosenTag);
    }
  },
  handleRepoClick: function handleRepoClick() {
    var repoUri = "https://hub.docker.com/";
    if (this.props.image.namespace === "library") {
      repoUri = repoUri + "_/" + this.props.image.name;
    } else {
      repoUri = repoUri + "r/" + this.props.image.namespace + "/" + this.props.image.name;
    }
    _electron.shell.openExternal(repoUri);
  },
  searchTag: function searchTag(event) {
    this.setState({ searchTag: event.target.value });
  },

  focusSearchTagInput: function focusSearchTagInput() {
    this.refs.searchTagInput.getDOMNode().focus();
  },

  render: function render() {
    var _this = this;

    var name;
    if (this.props.image.namespace === "library") {
      name = _addons2.default.createElement(
        "div",
        null,
        _addons2.default.createElement(
          "div",
          { className: "namespace official" },
          "official"
        ),
        _addons2.default.createElement(
          "span",
          { className: "repo" },
          this.props.image.name
        )
      );
    } else {
      name = _addons2.default.createElement(
        "div",
        null,
        _addons2.default.createElement(
          "div",
          { className: "namespace" },
          this.props.image.namespace
        ),
        _addons2.default.createElement(
          "span",
          { className: "repo" },
          this.props.image.name
        )
      );
    }
    var description;
    if (this.props.image.description) {
      description = this.props.image.description;
    } else if (this.props.image.short_description) {
      description = this.props.image.short_description;
    } else {
      description = "No description.";
    }
    var logoStyle = {
      backgroundColor: this.props.image.gradient_start
    };
    var imgsrc;
    if (this.props.image.img) {
      imgsrc = "https://kitematic.com/recommended/" + this.props.image.img;
    } else {
      imgsrc = "https://kitematic.com/recommended/kitematic_html.png";
    }
    var tags;
    if (this.state.loading) {
      tags = _addons2.default.createElement(_reactRetinaImage2.default, { className: "items-loading", src: "loading.png" });
    } else if (this.state.tags.length === 0) {
      tags = _addons2.default.createElement(
        "div",
        { className: "no-items" },
        "No Tags"
      );
    } else {
      var tagDisplay = this.state.tags.filter(function (tag) {
        return tag.name.includes(_this.state.searchTag);
      }).map(function (tag) {
        var t = "";
        if (tag.name) {
          t = tag.name;
        } else {
          t = tag;
        }
        var key = t;
        if (typeof key === "undefined") {
          key = _this.props.image.name;
        }
        if (t === _this.state.chosenTag) {
          return _addons2.default.createElement(
            "div",
            {
              className: "item active",
              key: key,
              onClick: _this.handleTagClick.bind(_this, t)
            },
            t
          );
        } else {
          return _addons2.default.createElement(
            "div",
            {
              className: "item",
              key: key,
              onClick: _this.handleTagClick.bind(_this, t)
            },
            t
          );
        }
      });
      tags = _addons2.default.createElement(
        "div",
        { className: "item-list tag-list" },
        tagDisplay
      );
    }

    var networkDisplay = this.state.networks.map(function (network) {
      var networkName = network.Name;
      if (networkName === _this.state.defaultNetwork) {
        return _addons2.default.createElement(
          "div",
          {
            className: "item active",
            key: networkName,
            onClick: _this.handleNetworkClick.bind(_this, networkName)
          },
          networkName
        );
      } else {
        return _addons2.default.createElement(
          "div",
          {
            className: "item",
            key: networkName,
            onClick: _this.handleNetworkClick.bind(_this, networkName)
          },
          networkName
        );
      }
    });
    var networks = _addons2.default.createElement(
      "div",
      { className: "item-list network-list" },
      networkDisplay
    );

    var badge = null;
    if (this.props.image.namespace === "library") {
      badge = _addons2.default.createElement("span", { className: "icon icon-badge-official" });
    } else if (this.props.image.is_private) {
      badge = _addons2.default.createElement("span", { className: "icon icon-badge-private" });
    }

    var create = void 0,
        overlay = void 0;
    if (this.props.image.is_local) {
      create = _addons2.default.createElement(
        "div",
        { className: "actions" },
        _addons2.default.createElement(
          "div",
          { className: "favorites" },
          _addons2.default.createElement(
            "span",
            { className: "icon icon-tag" },
            " ",
            this.state.chosenTag
          ),
          _addons2.default.createElement("span", { className: "text" })
        ),
        _addons2.default.createElement(
          "div",
          { className: "more-menu", onClick: this.handleMenuOverlayClick },
          _addons2.default.createElement("span", { className: "icon icon-more" })
        ),
        _addons2.default.createElement(
          "div",
          { className: "action", onClick: this.handleClick },
          "CREATE"
        )
      );
      overlay = _addons2.default.createElement(
        "div",
        { className: "overlay menu-overlay" },
        _addons2.default.createElement(
          "div",
          {
            className: "menu-item",
            onClick: this.handleTagOverlayClick.bind(this, this.props.image.name)
          },
          _addons2.default.createElement("span", { className: "icon icon-tag" }),
          _addons2.default.createElement(
            "span",
            { className: "text" },
            "SELECTED TAG:",
            " ",
            _addons2.default.createElement(
              "span",
              { className: "selected-item" },
              this.state.chosenTag
            )
          )
        ),
        _addons2.default.createElement(
          "div",
          {
            className: "remove",
            onClick: this.handleDeleteImgClick.bind(this, this.props.image)
          },
          _addons2.default.createElement(
            "span",
            {
              className: "btn btn-delete btn-action has-icon btn-hollow",
              disabled: this.props.image.inUse ? "disabled" : null
            },
            _addons2.default.createElement("span", { className: "icon icon-delete" }),
            "Delete Tag"
          )
        ),
        this.props.image.inUse ? _addons2.default.createElement(
          "p",
          { className: "small" },
          "To delete, remove all containers",
          _addons2.default.createElement("br", null),
          "using the above image"
        ) : null,
        _addons2.default.createElement(
          "div",
          { className: "close-overlay" },
          _addons2.default.createElement(
            "a",
            {
              className: "btn btn-action circular",
              onClick: this.handleCloseMenuOverlay
            },
            _addons2.default.createElement("span", { className: "icon icon-delete" })
          )
        )
      );
    } else {
      var favCount = this.props.image.star_count < 1000 ? (0, _numeral2.default)(this.props.image.star_count).value() : (0, _numeral2.default)(this.props.image.star_count).format("0.0a").toUpperCase();
      var pullCount = this.props.image.pull_count < 1000 ? (0, _numeral2.default)(this.props.image.pull_count).value() : (0, _numeral2.default)(this.props.image.pull_count).format("0a").toUpperCase();
      create = _addons2.default.createElement(
        "div",
        { className: "actions" },
        _addons2.default.createElement(
          "div",
          { className: "more-menu", onClick: this.handleMenuOverlayClick },
          _addons2.default.createElement("span", { className: "icon icon-more" })
        ),
        _addons2.default.createElement(
          "div",
          { className: "action", onClick: this.handleClick },
          "CREATE"
        )
      );

      overlay = _addons2.default.createElement(
        "div",
        { className: "overlay menu-overlay" },
        _addons2.default.createElement(
          "div",
          {
            className: "menu-item",
            onClick: this.handleTagOverlayClick.bind(this, this.props.image.name)
          },
          _addons2.default.createElement("span", { className: "icon icon-tag" }),
          _addons2.default.createElement(
            "span",
            { className: "text" },
            "SELECTED TAG:",
            " ",
            _addons2.default.createElement(
              "span",
              { className: "selected-item" },
              this.state.chosenTag
            )
          )
        ),
        _addons2.default.createElement(
          "div",
          {
            className: "menu-item",
            onClick: this.handleNetworkOverlayClick.bind(this, this.props.image.name)
          },
          _addons2.default.createElement("span", { className: "icon icon-link" }),
          _addons2.default.createElement(
            "span",
            { className: "text" },
            "DEFAULT NETWORK:",
            " ",
            _addons2.default.createElement(
              "span",
              { className: "selected-item" },
              this.state.defaultNetwork
            )
          )
        ),
        _addons2.default.createElement(
          "div",
          { className: "menu-item", onClick: this.handleRepoClick },
          _addons2.default.createElement("span", { className: "icon icon-open-external" }),
          _addons2.default.createElement(
            "span",
            { className: "text" },
            "VIEW ON DOCKER HUB"
          )
        ),
        _addons2.default.createElement(
          "div",
          { className: "close-overlay" },
          _addons2.default.createElement(
            "a",
            {
              className: "btn btn-action circular",
              onClick: this.handleCloseMenuOverlay
            },
            _addons2.default.createElement("span", { className: "icon icon-delete" })
          )
        )
      );
    }

    var searchTagInputStyle = { outline: "none", width: "calc(100% - 30px)" };

    return _addons2.default.createElement(
      "div",
      { className: "image-item" },
      overlay,
      _addons2.default.createElement(
        "div",
        { className: "overlay item-overlay tag-overlay" },
        _addons2.default.createElement(
          "p",
          null,
          _addons2.default.createElement("input", {
            ref: "searchTagInput",
            style: searchTagInputStyle,
            type: "text",
            placeholder: "Filter image tag.",
            onChange: this.searchTag
          })
        ),
        tags,
        _addons2.default.createElement(
          "div",
          { className: "close-overlay", onClick: this.handleCloseTagOverlay },
          _addons2.default.createElement(
            "a",
            { className: "btn btn-action circular" },
            _addons2.default.createElement("span", { className: "icon icon-delete" })
          )
        )
      ),
      _addons2.default.createElement(
        "div",
        { className: "overlay item-overlay network-overlay" },
        _addons2.default.createElement(
          "p",
          null,
          "Please select an default network."
        ),
        networks,
        _addons2.default.createElement(
          "div",
          {
            className: "close-overlay",
            onClick: this.handleCloseNetworkOverlay
          },
          _addons2.default.createElement(
            "a",
            { className: "btn btn-action circular" },
            _addons2.default.createElement("span", { className: "icon icon-delete" })
          )
        )
      ),
      _addons2.default.createElement(
        "div",
        { className: "card" },
        _addons2.default.createElement(
          "div",
          { className: "info" },
          _addons2.default.createElement(
            "div",
            { className: "badges" },
            badge
          ),
          _addons2.default.createElement(
            "div",
            { className: "name" },
            name
          ),
          _addons2.default.createElement(
            "div",
            { className: "description" },
            description
          )
        ),
        create
      )
    );
  }
});

module.exports = ImageCard;
