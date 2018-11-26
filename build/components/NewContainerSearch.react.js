"use strict";

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _addons = require("react/addons");

var _addons2 = _interopRequireDefault(_addons);

var _reactRouter = require("react-router");

var _reactRouter2 = _interopRequireDefault(_reactRouter);

var _reactRetinaImage = require("react-retina-image");

var _reactRetinaImage2 = _interopRequireDefault(_reactRetinaImage);

var _ImageCard = require("./ImageCard.react");

var _ImageCard2 = _interopRequireDefault(_ImageCard);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _MetricsUtil = require("../utils/MetricsUtil");

var _MetricsUtil2 = _interopRequireDefault(_MetricsUtil);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

var _RepositoryActions = require("../actions/RepositoryActions");

var _RepositoryActions2 = _interopRequireDefault(_RepositoryActions);

var _RepositoryStore = require("../stores/RepositoryStore");

var _RepositoryStore2 = _interopRequireDefault(_RepositoryStore);

var _AccountStore = require("../stores/AccountStore");

var _AccountStore2 = _interopRequireDefault(_AccountStore);

var _AccountActions = require("../actions/AccountActions");

var _AccountActions2 = _interopRequireDefault(_AccountActions);

var _ImageActions = require("../actions/ImageActions");

var _ImageActions2 = _interopRequireDefault(_ImageActions);

var _ImageStore = require("../stores/ImageStore");

var _ImageStore2 = _interopRequireDefault(_ImageStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _searchPromise = null;

module.exports = _addons2.default.createClass({
  displayName: "exports",

  mixins: [_reactRouter2.default.Navigation, _reactRouter2.default.State],
  getInitialState: function getInitialState() {
    return {
      query: "",
      loading: _RepositoryStore2.default.loading(),
      repos: _RepositoryStore2.default.all(),
      images: _ImageStore2.default.all(),
      imagesErr: _ImageStore2.default.error,
      username: _AccountStore2.default.getState().username,
      verified: _AccountStore2.default.getState().verified,
      accountLoading: _AccountStore2.default.getState().loading,
      error: _RepositoryStore2.default.getState().error,
      currentPage: _RepositoryStore2.default.getState().currentPage,
      totalPage: _RepositoryStore2.default.getState().totalPage,
      previousPage: _RepositoryStore2.default.getState().previousPage,
      nextPage: _RepositoryStore2.default.getState().nextPage
    };
  },
  componentDidMount: function componentDidMount() {
    this.refs.searchInput.getDOMNode().focus();
    _RepositoryStore2.default.listen(this.update);
    _AccountStore2.default.listen(this.updateAccount);
    _ImageStore2.default.listen(this.updateImage);
    _RepositoryActions2.default.search();
  },
  componentWillUnmount: function componentWillUnmount() {
    if (_searchPromise) {
      _searchPromise.cancel();
    }

    _RepositoryStore2.default.unlisten(this.update);
    _AccountStore2.default.unlisten(this.updateAccount);
  },
  update: function update() {
    this.setState({
      loading: _RepositoryStore2.default.loading(),
      repos: _RepositoryStore2.default.all(),
      currentPage: _RepositoryStore2.default.getState().currentPage,
      totalPage: _RepositoryStore2.default.getState().totalPage,
      previousPage: _RepositoryStore2.default.getState().previousPage,
      nextPage: _RepositoryStore2.default.getState().nextPage,
      error: _RepositoryStore2.default.getState().error
    });
  },
  updateImage: function updateImage(imgStore) {
    this.setState({
      images: imgStore.images,
      error: imgStore.error
    });
  },
  updateAccount: function updateAccount() {
    this.setState({
      username: _AccountStore2.default.getState().username,
      verified: _AccountStore2.default.getState().verified,
      accountLoading: _AccountStore2.default.getState().loading
    });
  },
  search: function search(query) {
    var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    if (_searchPromise) {
      _searchPromise.cancel();
      _searchPromise = null;
    }
    var previousPage = void 0,
        nextPage = void 0,
        totalPage = null;
    // If query remains, retain pagination
    if (this.state.query === query) {
      previousPage = page - 1 < 1 ? 1 : page - 1;
      nextPage = page + 1 > this.state.totalPage ? this.state.totalPage : page + 1;
      totalPage = this.state.totalPage;
    }
    this.setState({
      query: query,
      loading: true,
      currentPage: page,
      previousPage: previousPage,
      nextPage: nextPage,
      totalPage: totalPage,
      error: null
    });

    _searchPromise = _bluebird2.default.delay(200).cancellable().then(function () {
      _MetricsUtil2.default.track("Searched for Images");
      _searchPromise = null;
      _RepositoryActions2.default.search(query, page);
    }).catch(_bluebird2.default.CancellationError, function () {});
  },
  handleChange: function handleChange(e) {
    var query = e.target.value;
    if (query === this.state.query) {
      return;
    }
    this.search(query);
  },
  handlePage: function handlePage(page) {
    var query = this.state.query;
    this.search(query, page);
  },
  handleFilter: function handleFilter(filter) {
    this.setState({ error: null });

    // If we're clicking on the filter again - refresh
    if (filter === "userrepos" && this.getQuery().filter === "userrepos") {
      _RepositoryActions2.default.repos();
    }

    if (filter === "userimages" && this.getQuery().filter === "userimages") {
      _ImageActions2.default.all();
    }

    if (filter === "recommended" && this.getQuery().filter === "recommended") {
      _RepositoryActions2.default.recommended();
    }

    this.transitionTo("search", {}, { filter: filter });

    _MetricsUtil2.default.track("Filtered Results", {
      filter: filter
    });
  },
  handleCheckVerification: function handleCheckVerification() {
    _AccountActions2.default.verify();
    _MetricsUtil2.default.track("Verified Account", {
      from: "search"
    });
  },
  render: function render() {
    var _this = this;

    var filter = this.getQuery().filter || "all";
    var repos = _underscore2.default.values(this.state.repos).filter(function (repo) {
      if (repo.is_recommended || repo.is_user_repo) {
        return repo.name.toLowerCase().indexOf(_this.state.query.toLowerCase()) !== -1 || repo.namespace.toLowerCase().indexOf(_this.state.query.toLowerCase()) !== -1;
      }
      return true;
    }).filter(function (repo) {
      return filter === "all" || filter === "recommended" && repo.is_recommended || filter === "userrepos" && repo.is_user_repo;
    });

    var results = void 0,
        paginateResults = void 0;
    var previous = [];
    var next = [];
    if (this.state.previousPage) {
      var previousPage = this.state.currentPage - 7;
      if (previousPage < 1) {
        previousPage = 1;
      }
      previous.push(_addons2.default.createElement(
        "li",
        null,
        _addons2.default.createElement(
          "a",
          { href: "", onClick: this.handlePage.bind(this, 1), "aria-label": "First" },
          _addons2.default.createElement(
            "span",
            { "aria-hidden": "true" },
            "\xAB"
          )
        )
      ));
      for (previousPage; previousPage < this.state.currentPage; previousPage++) {
        previous.push(_addons2.default.createElement(
          "li",
          null,
          _addons2.default.createElement(
            "a",
            { href: "", onClick: this.handlePage.bind(this, previousPage) },
            previousPage
          )
        ));
      }
    }
    if (this.state.nextPage) {
      var nextPage = this.state.currentPage + 1;
      for (nextPage; nextPage < this.state.totalPage; nextPage++) {
        next.push(_addons2.default.createElement(
          "li",
          null,
          _addons2.default.createElement(
            "a",
            { href: "", onClick: this.handlePage.bind(this, nextPage) },
            nextPage
          )
        ));
        if (nextPage > this.state.currentPage + 7) {
          break;
        }
      }
      next.push(_addons2.default.createElement(
        "li",
        null,
        _addons2.default.createElement(
          "a",
          {
            href: "",
            onClick: this.handlePage.bind(this, this.state.totalPage),
            "aria-label": "Last"
          },
          _addons2.default.createElement(
            "span",
            { "aria-hidden": "true" },
            "\xBB"
          )
        )
      ));
    }

    var current = _addons2.default.createElement(
      "li",
      { className: "active" },
      _addons2.default.createElement(
        "span",
        null,
        this.state.currentPage,
        " ",
        _addons2.default.createElement(
          "span",
          { className: "sr-only" },
          "(current)"
        )
      )
    );
    paginateResults = (next.length || previous.length) && this.state.query !== "" ? _addons2.default.createElement(
      "nav",
      null,
      _addons2.default.createElement(
        "ul",
        { className: "pagination" },
        previous,
        current,
        next
      )
    ) : null;
    var errorMsg = null;
    if (this.state.error === null || this.state.error.message.indexOf("getaddrinfo ENOTFOUND") !== -1) {
      errorMsg = "There was an error contacting Docker Hub.";
    } else {
      errorMsg = this.state.error.message.replace("HTTP code is 409 which indicates error: conflict - ", "");
    }
    if (this.state.error) {
      results = _addons2.default.createElement(
        "div",
        { className: "no-results" },
        _addons2.default.createElement(
          "h2",
          { className: "error" },
          errorMsg
        )
      );
      paginateResults = null;
    } else if (filter === "userrepos" && !_AccountStore2.default.getState().username) {
      results = _addons2.default.createElement(
        "div",
        { className: "no-results" },
        _addons2.default.createElement(
          "h2",
          null,
          _addons2.default.createElement(
            _reactRouter2.default.Link,
            { to: "login" },
            "Log In"
          ),
          " or",
          " ",
          _addons2.default.createElement(
            _reactRouter2.default.Link,
            { to: "signup" },
            "Sign Up"
          ),
          " to access your Docker Hub repositories."
        ),
        _addons2.default.createElement(_reactRetinaImage2.default, { src: "connect-art.png", checkIfRetinaImgExists: false })
      );
      paginateResults = null;
    } else if (filter === "userrepos" && !_AccountStore2.default.getState().verified) {
      var spinner = this.state.accountLoading ? _addons2.default.createElement(
        "div",
        { className: "spinner la-ball-clip-rotate la-dark" },
        _addons2.default.createElement("div", null)
      ) : null;
      results = _addons2.default.createElement(
        "div",
        { className: "no-results" },
        _addons2.default.createElement(
          "h2",
          null,
          "Please verify your Docker Hub account email address"
        ),
        _addons2.default.createElement(
          "div",
          { className: "verify" },
          _addons2.default.createElement(
            "button",
            {
              className: "btn btn-action",
              onClick: this.handleCheckVerification
            },
            "I've Verified My Email Address"
          ),
          " ",
          spinner
        ),
        _addons2.default.createElement(_reactRetinaImage2.default, { src: "inspection.png", checkIfRetinaImgExists: false })
      );
      paginateResults = null;
    } else if (filter === "userimages") {
      // filter out dangling images (aka images with no name/tag)
      var validImages = this.state.images.filter(function (image) {
        return image.name !== "<none>";
      });
      var userImageItems = validImages.map(function (image, index) {
        image.description = null;
        var tags = image.tags.join("-");
        image.star_count = 0;
        image.is_local = true;
        var key = "local-" + image.name + "-" + index;
        return _addons2.default.createElement(_ImageCard2.default, {
          key: key + ":" + tags,
          image: image,
          chosenTag: image.tags[0],
          tags: image.tags
        });
      });
      var userImageResults = userImageItems.length ? _addons2.default.createElement(
        "div",
        { className: "result-grids" },
        _addons2.default.createElement(
          "div",
          null,
          _addons2.default.createElement(
            "h4",
            null,
            "My Images"
          ),
          _addons2.default.createElement(
            "div",
            { className: "result-grid" },
            userImageItems
          )
        )
      ) : _addons2.default.createElement(
        "div",
        { className: "no-results" },
        _addons2.default.createElement(
          "h2",
          null,
          "Cannot find any local image."
        )
      );
      results = { userImageResults: userImageResults };
    } else if (this.state.loading) {
      results = _addons2.default.createElement(
        "div",
        { className: "no-results" },
        _addons2.default.createElement(
          "div",
          { className: "loader" },
          _addons2.default.createElement(
            "h2",
            null,
            "Loading Images"
          ),
          _addons2.default.createElement(
            "div",
            { className: "spinner la-ball-clip-rotate la-dark la-lg" },
            _addons2.default.createElement("div", null)
          )
        )
      );
    } else if (repos.length) {
      var recommendedItems = repos.filter(function (repo) {
        return repo.is_recommended;
      }).map(function (image, index) {
        var key = "rec-" + image.name + "-" + index;
        return _addons2.default.createElement(_ImageCard2.default, { key: key, image: image });
      });
      var otherItems = repos.filter(function (repo) {
        return !repo.is_recommended && !repo.is_user_repo;
      }).map(function (image, index) {
        var key = "other-" + image.name + "-" + index;
        return _addons2.default.createElement(_ImageCard2.default, { key: key, image: image });
      });

      var recommendedResults = recommendedItems.length ? _addons2.default.createElement(
        "div",
        null,
        _addons2.default.createElement(
          "h4",
          null,
          "Other Widely Known Images"
        ),
        _addons2.default.createElement(
          "div",
          { className: "result-grid" },
          recommendedItems
        )
      ) : null;

      var userRepoItems = repos.filter(function (repo) {
        return repo.is_user_repo;
      }).map(function (image, index) {
        var key = "usr-" + image.name + "-" + index;
        return _addons2.default.createElement(_ImageCard2.default, { key: key, image: image });
      });
      var userRepoResults = userRepoItems.length ? _addons2.default.createElement(
        "div",
        null,
        _addons2.default.createElement(
          "h4",
          null,
          "My Repositories"
        ),
        _addons2.default.createElement(
          "div",
          { className: "result-grid" },
          userRepoItems
        )
      ) : null;

      var otherResults = void 0;
      if (otherItems.length) {
        otherResults = _addons2.default.createElement(
          "div",
          null,
          _addons2.default.createElement(
            "h4",
            null,
            "Other Repositories"
          ),
          _addons2.default.createElement(
            "div",
            { className: "result-grid" },
            otherItems
          )
        );
      } else {
        otherResults = null;
        paginateResults = null;
      }

      results = _addons2.default.createElement(
        "div",
        { className: "result-grids" },
        userRepoResults,
        otherResults
      );
    } else {
      if (this.state.query.length) {
        results = _addons2.default.createElement(
          "div",
          { className: "no-results" },
          _addons2.default.createElement(
            "h2",
            null,
            "Cannot find a matching image."
          )
        );
      } else {
        results = _addons2.default.createElement(
          "div",
          { className: "no-results" },
          _addons2.default.createElement(
            "h2",
            null,
            "No Images"
          )
        );
      }
    }

    var loadingClasses = (0, _classnames2.default)({
      hidden: !this.state.loading,
      spinner: true,
      loading: true,
      "la-ball-clip-rotate": true,
      "la-dark": true,
      "la-sm": true
    });

    var magnifierClasses = (0, _classnames2.default)({
      hidden: this.state.loading,
      icon: true,
      "icon-search": true,
      "search-icon": true
    });
    var searchClasses = (0, _classnames2.default)("search-bar");
    if (filter === "userimages") {
      searchClasses = (0, _classnames2.default)("search-bar", {
        hidden: true
      });
    }

    return _addons2.default.createElement(
      "div",
      { className: "details" },
      _addons2.default.createElement(
        "div",
        { className: "new-container" },
        _addons2.default.createElement(
          "div",
          { className: "new-container-header" },
          _addons2.default.createElement(
            "div",
            { className: "search" },
            _addons2.default.createElement(
              "div",
              { className: searchClasses },
              _addons2.default.createElement("input", {
                type: "search",
                ref: "searchInput",
                className: "form-control",
                placeholder: "Search for Docker images from Docker Hub",
                onChange: this.handleChange
              }),
              _addons2.default.createElement("div", { className: magnifierClasses }),
              _addons2.default.createElement(
                "div",
                { className: loadingClasses },
                _addons2.default.createElement("div", null)
              )
            )
          ),
          _addons2.default.createElement(
            "div",
            { className: "results-filters" },
            _addons2.default.createElement(
              "span",
              {
                className: "results-filter results-all tab " + (filter === "all" ? "active" : ""),
                onClick: this.handleFilter.bind(this, "all")
              },
              "Images"
            )
          )
        ),
        _addons2.default.createElement(
          "div",
          { className: "results" },
          results
        ),
        _addons2.default.createElement(
          "div",
          { className: "pagination-center" },
          paginateResults
        )
      )
    );
  }
});
