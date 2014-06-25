/** @jsx React.DOM */

"use strict";

var $ = require("jquery");
var _ = require("underscore");
var React = require("react");
var Route = require("react-nested-router").Route;
var marked = require("marked");
var moment = require("moment");
var store = require("store");
var transitionTo = require("react-nested-router").transitionTo;
// TODO(alpert): Get a public API exposed for this
var transitionToPath =
  require("react-nested-router/modules/stores/URLStore").push;

// For React devtools
window.React = React;
// Bootstrap JS depends on jQuery being set globally
// TODO(alpert): Figure out how to load these from npm more smartly
window.jQuery = $;
require("../lib/js/bootstrap-typeahead.js");
require("../lib/js/bootstrap-tooltip.js");
require("../lib/js/bootstrap-popover.js");
require("../lib/js/bootstrap-transition.js");
require("../lib/js/bootstrap-collapse.js");
require("../lib/js/bootstrap-dropdown.js");

var fetchAllCategories = require("./fetchAllCategories.js");

// TODO(david): We might want to split up this file more.

var D_KEYCODE = 'D'.charCodeAt(0),
    G_KEYCODE = 'G'.charCodeAt(0),
    H_KEYCODE = 'H'.charCodeAt(0),
    J_KEYCODE = 'J'.charCodeAt(0),
    K_KEYCODE = 'K'.charCodeAt(0),
    L_KEYCODE = 'L'.charCodeAt(0),
    N_KEYCODE = 'N'.charCodeAt(0),
    O_KEYCODE = 'O'.charCodeAt(0),
    P_KEYCODE = 'P'.charCodeAt(0),
    U_KEYCODE = 'U'.charCodeAt(0),
    ENTER_KEYCODE = 13,
    ESCAPE_KEYCODE = 27;

// A cache of all tag IDs and their counts.
var allTags = {};

var clamp = function(num, min, max) {
  return Math.min(Math.max(num, min), max);
};

var capitalizeFirstLetter = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

var startsWith = function(str, startStr) {
  return str.indexOf(startStr) === 0;
};

var endsWith = function(str, endStr) {
  return str.indexOf(endStr, str.length - endStr.length) !== -1;
};

/**
 * Scrolls the window so that the entirety of `domNode` is visible.
 * @param {Element} domNode The DOM node to scroll into view.
 * @param {number=} context An optional amount of context (minimum distance
 * from top or bottom of screen) to keep in pixels. Defaults to 0.
 */
var scrollToNode = function(domNode, context) {
  context = context || 0;
  var windowTop = $(window).scrollTop();
  var windowHeight = $(window).height();
  var windowBottom = windowHeight + windowTop;
  var elementTop = $(domNode).offset().top;
  var elementBottom = elementTop + $(domNode).height();

  if (elementBottom + context > windowBottom) {
    window.scrollTo(0, elementBottom + 100 - windowHeight);
  } else if (elementTop - context < windowTop) {
    window.scrollTo(0, Math.max(0, elementTop - context));
  }
};

/**
 * A temporary notice that this site is still a work in progress!
 */
var WipNotice = React.createClass({
  render: function() {
    return <div className="wip-notice">
      Hi, you've discovered a work in progress!{' '}
      <a href="https://docs.google.com/document/d/1hUYiWCjup9JMWirASnO_Z2k7AJJL-KPgFKZ0C7vvUMU/edit#" target="_blank">
        See this Google Doc for more info
      </a>
      {' '}and to leave any feedback. Thank you. :)
    </div>;
  }
});

var Sidebar = React.createClass({
  getInitialState: function() {
    return {
      categories: []
    };
  },

  componentDidMount: function() {
    fetchAllCategories(function(categories) {
      if (this.isMounted()) {
        this.setState({categories: categories});
      }
    }.bind(this));

    // This event is triggered by Bootstrap's collapse widget (which creates the
    // accordion) when a category is expanded.
    $(this.refs.categories.getDOMNode()).on('show', this.onCategoryShow);
  },

  onCategoryShow: function(e) {
    var category = $(e.target).data('category');
    transitionTo("plugin-list", null, {"q": "cat:" + category});
  },

  render: function() {
    var categoryElements = _.chain(this.state.categories)
      .reject(function(category) { return category.id === "uncategorized"; })
      .map(function(category) {
        var tagsClass = category.id + "-tags";
        var tagElements = _.map(category.tags, function(tag) {
          return <li key={tag.id}>
            <a href={"/?q=tag:" + encodeURIComponent(tag.id)}
                className="tag-link">
              <span className="tag-id">{tag.id}</span>
              {tag.count > 1 &&
                <span className="tag-count"> × {tag.count}</span>
              }
            </a>
          </li>;
        });

        return <li className={"accordion-group category " + category.id}
            key={category.id}>
          <a data-toggle="collapse" data-target={"." + tagsClass}
              data-parent=".categories" className="category-link">
            <i className={category.icon}></i>{category.name}
          </a>
          <div className={"collapse " + tagsClass} data-category={category.id}>
            <ul className="category-tags">{tagElements}</ul>
          </div>
        </li>;
      })
      .value();

    return <div className="sidebar">
      <h1 className="title">
        <a href="/">
          <span className="vim">Vim</span>Awesome
        </a>
      </h1>
      <div className="tac">
        <div className="subtitle">
          <div className="line1">Awesome Vim plugins</div>
          <div className="from">from</div>
          <div className="line2">across the Universe</div>
        </div>
      </div>
      <ul ref="categories" className="categories">{categoryElements}</ul>
      <a href="/submit" className="submit-plugin">
        <i className="icon-plus"></i>Submit plugin
      </a>
    </div>;
  }
});

// Site footer
var Footer = React.createClass({
  render: function() {
    return <div className="site-footer">
      <div className="first-row clearfix">
        <div className="about-section">
          <div className="about">
            Vim Awesome is a directory of Vim plugins sourced from GitHub,
            Vim.org, and user submissions. Plugin usage data is extracted from
            dotfiles repos on GitHub.
          </div>
          <div className="credits">
            Made with vim and vigor by
            {' '}<a target="_blank" href="https://twitter.com/divad12">
              David Hu
            </a>,
            {' '}<a target="_blank" href="http://benalpert.com">
              Ben Alpert
            </a>, and
            {' '}<a target="_blank" href="https://github.com/xymostech">
              Emily Eisenberg
            </a>.
          </div>
        </div>
        <div className="github-section">
          <a href="https://github.com/divad12/vim-awesome"
              className="github-link">
            Contribute
            <i className="icon-github"></i>
            on GitHub
          </a>
        </div>
        <div className="links-section">
          <ul className="links">
            <li><a href="/about">About</a></li>
            <li><a href="/submit">Submit</a></li>
            <li><a href="mailto:emacs@vimawesome.com">Email us</a></li>
            <li><a href="#">RSS feed</a></li>
          </ul>
        </div>
      </div>
    </div>;
  }
});

var SearchBox = React.createClass({
  componentDidMount: function() {
    window.addEventListener("keyup", this.windowKeyUp, false);
  },

  componentWillUnmount: function() {
    window.removeEventListener("keyup", this.windowKeyUp, false);
  },

  windowKeyUp: function(e) {
    var tag = e.target.tagName;
    var key = e.keyCode;
    if (tag !== "INPUT" && tag !== "TEXTAREA" &&
        key === 191 /* forward slash */) {
      var inputElement = this.refs.input.getDOMNode();
      inputElement.focus();
      inputElement.select();
      this.props.onFocus();
    }
  },

  handleKeyUp: function(e) {
    var key = e.nativeEvent.keyCode;
    if (key === ESCAPE_KEYCODE || key === ENTER_KEYCODE) {
      this.refs.input.getDOMNode().blur();
      this.props.onBlur();
    }
  },

  onChange: function(e) {
    this.props.onChange(this.refs.input.getDOMNode().value);
  },

  render: function() {
    return <div className="search-container">
      <i className="icon-search"></i>
      <input type="text" className="search" placeholder="Search" ref="input"
          value={this.props.searchQuery} onChange={this.onChange}
          onKeyUp={this.handleKeyUp} />
    </div>;
  }
});

var Pager = React.createClass({
  propTypes: {
    currentPage: React.PropTypes.number.isRequired,
    totalPages: React.PropTypes.number.isRequired
  },

  componentDidMount: function() {
    window.addEventListener("keyup", this.onWindowKeyDown, false);
  },

  componentWillUnmount: function() {
    window.removeEventListener("keyup", this.onWindowKeyDown, false);
  },

  onWindowKeyDown: function(e) {
    var tag = e.target.tagName;
    var key = e.keyCode;

    if (tag !== "INPUT" && tag !== "TEXTAREA") {
      if (key === P_KEYCODE) {
        this.goToPrevPage();
      } else if (key === N_KEYCODE) {
        this.goToNextPage();
      }
    }
  },

  goToPage: function(page) {
    var newPage = clamp(page, 1, this.props.totalPages);
    this.props.onPageChange(newPage);
  },

  goToPrevPage: function() {
    this.goToPage(this.props.currentPage - 1);
  },

  goToNextPage: function() {
    this.goToPage(this.props.currentPage + 1);
  },

  onPrevClick: function(e) {
    e.preventDefault();
    this.goToPrevPage();
  },

  onNextClick: function(e) {
    e.preventDefault();
    this.goToNextPage();
  },

  render: function() {
    var currentPage = this.props.currentPage;
    var totalPages = this.props.totalPages;

    if (totalPages <= 1) {
      return <div />;
    }

    // TODO(david): Have buttons for page numbers, including first page, last
    //     page, and current page.
    return <div className="pagination">
      <ul>
        {currentPage > 1 &&
          <li>
            <a className="pager-button prev-page-button" href="#"
                onClick={this.onPrevClick}>
              {"\u2190"}<code>P</code>
            </a>
          </li>
        }
        <li>
          <a className="page-number">Page {currentPage} of {totalPages}</a>
        </li>
        {currentPage < totalPages &&
          <li>
            <a className="pager-button next-page-button" href="#"
                onClick={this.onNextClick}>
              <code>N</code> Next page
              <span className="right-arrow">{"\u2192"}</span>
            </a>
          </li>
        }
      </ul>
    </div>;
  }
});

var Plugin = React.createClass({
  getInitialState: function() {
    var pluginId = this.props.plugin.slug;
    var pluginStore = pluginId && store.enabled &&
        store.get("plugin-" + pluginId);

    return {
      hasVisited: pluginStore && pluginStore.hasVisited
    };
  },

  componentDidMount: function() {
    this.addBootstrapTooltips();
  },

  componentWillUnmount: function() {
    $(this.getDOMNode()).find('[title]').tooltip('destroy');
  },

  componentDidUpdate: function() {
    this.addBootstrapTooltips();
  },

  addBootstrapTooltips: function() {
    $(this.getDOMNode()).find('[title]').tooltip({
      animation: false,
      container: 'body'
    });
  },

  goToDetailsPage: function() {
    transitionTo("plugin", {slug: this.props.plugin.slug});
  },

  render: function() {
    // TODO(david): Animations on initial render
    var plugin = this.props.plugin;
    if (!plugin || !plugin.name) {
      return <li className="plugin"></li>;
    }

    var hasNavFocus = this.props.hasNavFocus;
    return <li
        className={"plugin" + (hasNavFocus ? " nav-focus" : "") +
            (this.state.hasVisited ? " visited" : "")}
        onMouseEnter={this.props.onMouseEnter}>
      <a href={"plugin/" + plugin.slug}>
        <h3 className={"plugin-name " + plugin.category}>{plugin.name}</h3>
        {plugin.author && <span className="by">by</span>}
        {plugin.author &&
          <span className="author">{" " + plugin.author}</span>}
        {plugin.github_stars > 0 &&
          <div className="github-stars"
              title={plugin.github_stars + " stars on GitHub"}>
            {plugin.github_stars}<i className="icon-star"></i>
          </div>
        }
        {plugin.plugin_manager_users > 0 &&
          <div className="plugin-users"
              title={plugin.plugin_manager_users +
              " Vundle/Pathogen/NeoBundle users on GitHub"}>
            {plugin.plugin_manager_users}<i className="icon-user"></i>
          </div>
        }
        <p className="short-desc">{plugin.short_desc}</p>
      </a>
    </li>;
  }
});

var Spinner = React.createClass({
  render: function() {
    return <div className="spinner">
      <div className="rect1" />
      <div className="rect2" />
      <div className="rect3" />
      <div className="rect4" />
      <div className="rect5" />
    </div>;
  }
});

var PluginList = React.createClass({
  getInitialState: function() {
    return {
      plugins: [],
      selectedIndex: -1,
      hoverDisabled: false,
      isLoading: false
    };
  },

  componentDidMount: function() {
    this.fetchPlugins(this.props);
    window.addEventListener("keydown", this.onWindowKeyDown, false);
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.searchQuery !== this.props.searchQuery) {
      this.setState({isLoading: true});
      this.fetchPluginsDebounced(nextProps);
    } else if (nextProps.currentPage !== this.props.currentPage) {
      this.setState({isLoading: true});
      this.fetchPluginsThrottled(nextProps);
    }
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    // Only re-render when new plugins have been fetched.
    return !_.isEqual(nextState, this.state);
  },

  componentWillUnmount: function() {
    clearTimeout(this.reenableHoverTimeout);
    window.removeEventListener("keydown", this.onWindowKeyDown, false);
  },

  select: function() {
    if (this.state.selectedIndex === -1) {
      this.setState({selectedIndex: 0});
    }
  },

  unselect: function() {
    if (this.state.selectedIndex !== -1) {
      this.setState({selectedIndex: -1});
    }
  },

  onWindowKeyDown: function(e) {
    // TODO(david): Duplicated code from SearchBox
    var tag = e.target.tagName;
    var key = e.keyCode;

    if (tag !== "INPUT" && tag !== "TEXTAREA") {
      if (key === J_KEYCODE || key === K_KEYCODE) {
        // Go to next or previous plugin
        var direction = (key === J_KEYCODE ? 1 : -1);
        var maxIndex = this.state.plugins.length - 1;
        var newIndex = clamp(
          this.state.selectedIndex + direction,
          0, maxIndex);

        // Disable hover when navigating plugins, because when the screen
        // scrolls, a MouseEnter event will be fired if the mouse is over a
        // plugin, causing the selection to jump back.
        this.setState({selectedIndex: newIndex, hoverDisabled: true});

        // Re-enable hover after a delay
        clearTimeout(this.reenableHoverTimeout);
        this.reenableHoverTimeout = setTimeout(function() {
          this.setState({hoverDisabled: false});
        }.bind(this), 400);

        // Scroll to the navigated plugin if available.
        if (this.refs && this.refs.navFocus) {
          scrollToNode(this.refs.navFocus.getDOMNode(), 105 /* context */);
        }
      } else if ((key === ENTER_KEYCODE || key === O_KEYCODE) &&
          this.refs && this.refs.navFocus) {
        e.preventDefault();
        this.refs.navFocus.goToDetailsPage();
      }
    }
  },

  onPluginMouseEnter: function(index, e) {
    // TODO(david): This is not as quick/snappy as CSS :hover ...
    if (this.state.hoverDisabled) {
      return;
    }
    this.setState({selectedIndex: index});
  },

  fetchPlugins: function(params) {
    this.setState({isLoading: true});

    // Abort any pending XHRs so that we don't update from a stale query.
    if (this.fetchPluginsXhr) {
      this.fetchPluginsXhr.abort();
    }

    this.fetchPluginsXhr = $.ajax({
      url: "/api/plugins",
      dataType: "json",
      data: {
        query: params.searchQuery,
        page: params.currentPage
      },
      success: this.onPluginsFetched
    });
  },

  onPluginsFetched: function(data) {
    this.setState({
      plugins: data.plugins,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      resultsPerPage: data.results_per_page,
      isLoading: false
    });

    // TODO(david): Give this prop a default value.
    this.props.onPluginsFetched();

    if (this.state.selectedIndex !== -1) {
      this.setState({selectedIndex: 0});
    }
  },

  fetchPluginsDebounced: _.debounce(function() {
    this.fetchPlugins.apply(this, arguments);
  }, 300),

  fetchPluginsThrottled: _.throttle(function() {
    this.fetchPlugins.apply(this, arguments);
  }, 500),

  render: function() {
    // TODO(david): We should not update the page number and other
    // search-params UI until new data has arrived to keep things consistent.

    var plugins = _.chain(this.state.plugins)
      .map(function(plugin, index) {
        var hasNavFocus = (index === this.state.selectedIndex);
        return <Plugin
            ref={hasNavFocus ? "navFocus" : ""}
            key={plugin.slug}
            hasNavFocus={hasNavFocus}
            plugin={plugin}
            onMouseEnter={this.onPluginMouseEnter.bind(this, index)} />;
      }, this)
      .value();

    var totalPages = this.state.totalPages || 0;
    var totalResults = this.state.totalResults || 0;
    var currentPage = this.props.currentPage;
    var resultsPerPage = this.state.resultsPerPage;
    var firstPlugin = (currentPage - 1) * resultsPerPage + 1;
    var lastPlugin = firstPlugin + this.state.plugins.length - 1;

    return <div className={"plugins-container" + (
        this.state.isLoading ? " loading" : "")}>
      {this.state.isLoading && <Spinner />}
      <div className="browsing-plugins">
        {currentPage > 1 && resultsPerPage ?
            'Plugins ' + firstPlugin + '-' + lastPlugin + ' of ' + totalResults
            : totalResults + ' plugins'}
      </div>
      <ul className="plugins">{plugins}</ul>
      <Pager currentPage={currentPage}
          totalPages={totalPages} onPageChange={this.props.onPageChange} />
    </div>;
  }
});

// Instructions for installing a plugin with Vundle.
var VundleInstructions = React.createClass({
  render: function() {
    var urlPath = (this.props.github_url || "").replace(
        /^https?:\/\/github.com\//, "");
    var vundleUri = urlPath.replace(/^vim-scripts\//, "");

    return <div>
      <p>Place this in your <code>.vimrc:</code></p>
      <pre>Bundle '{vundleUri}'</pre>
      <p>&hellip; then run the following in Vim:</p>
      <pre>:source %<br/>:BundleInstall</pre>
      {/* Hack to get triple-click in Chrome to not over-select. */}
      <div>{'\u00a0' /* &nbsp; */}</div>
    </div>;
  }
});

// Instructions for installing a plugin with NeoBundle (a manager based on
// Vundle).
var NeoBundleInstructions = React.createClass({
  render: function() {
    var urlPath = (this.props.github_url || "").replace(
        /^https?:\/\/github.com\//, "");
    var bundleUri = urlPath.replace(/^vim-scripts\//, "");

    return <div>
      <p>Place this in your <code>.vimrc:</code></p>
      <pre>NeoBundle '{bundleUri}'</pre>
      <p>&hellip; then run the following in Vim:</p>
      <pre>:source %<br/>:NeoBundleInstall</pre>
      {/* Hack to get triple-click in Chrome to not over-select. */}
      <div>{'\u00a0' /* &nbsp; */}</div>
    </div>;
  }
});

// Instructions for installing a plugin with Pathogen.
var PathogenInstructions = React.createClass({
  render: function() {
    return <div>
      <p>Run the following in a terminal:</p>
      <pre>cd ~/.vim/bundle<br/>git clone {this.props.github_url}
      </pre>
      {/* Hack to get triple-click in Chrome to not over-select. */}
      <div>{'\u00a0' /* &nbsp; */}</div>
    </div>;
  }
});

// Help text explaining what Vundle is and linking to more details.
var VundleTabPopover = React.createClass({
  render: function() {
    return <div>
      Vundle is short for Vim Bundle and is a plugin manager for Vim.
      <br/><br/>See{' '}
      <a href="https://github.com/gmarik/vundle" target="_blank">
        <i className="icon-github" /> gmarik/vundle
      </a>
    </div>;
  }
});

// Help text explaining what NeoBundle is and linking to more details.
var NeoBundleTabPopover = React.createClass({
  render: function() {
    return <div>
      NeoBundle is a Vim plugin manager based on Vundle but extended with more
      features.
      <br/><br/>See{' '}
      <a href="https://github.com/Shougo/neobundle.vim" target="_blank">
        <i className="icon-github" /> Shougo/neobundle.vim
      </a>
    </div>;
  }
});

// Help text explaining what Pathogen is and linking to more details.
var PathogenTabPopover = React.createClass({
  render: function() {
    return <div>
      Pathogen makes it super easy to install plugins and runtime files
      in their own private directories.
      <br/><br/>See{' '}
      <a href="https://github.com/tpope/vim-pathogen" target="_blank">
        <i className="icon-github" /> tpope/vim-pathogen
      </a>
    </div>;
  }
});

// The installation instructions (via Vundle, etc.) widget on the details page.
var Install = React.createClass({
  getInitialState: function() {
    var tabActive = (store.enabled && store.get("installTab")) || "vundle";
    return {
      tabActive: tabActive
    };
  },

  componentDidMount: function() {
    var popovers = {
      vundleTab: <VundleTabPopover />,
      neoBundleTab: <NeoBundleTabPopover />,
      pathogenTab: <PathogenTabPopover />
    };

    var self = this;
    _.each(popovers, function(component, ref) {
      var markup = React.renderComponentToString(component);
      var $tabElem = $(self.refs[ref].getDOMNode());
      $tabElem.popover({
        html: true,
        content: markup,
        placement: "left",
        animation: false,
        trigger: "hover",
        container: $tabElem
      });
    });
  },

  onTabClick: function(installMethod) {
    this.setState({tabActive: installMethod});
    if (store.enabled) {
      store.set("installTab", installMethod);
    }
  },

  render: function() {
    return <div className="install row-fluid">
      <div className="tabs-column">
        <h3 className="install-label">Install from</h3>
        <ul className="install-tabs">
          <li onClick={this.onTabClick.bind(this, "vundle")} ref="vundleTab"
              className={this.state.tabActive === "vundle" ? "active" : ""}>
            Vundle
          </li>
          <li onClick={this.onTabClick.bind(this, "neoBundle")}
              ref="neoBundleTab"
              className={this.state.tabActive === "neoBundle" ? "active" : ""}>
            NeoBundle
          </li>
          <li onClick={this.onTabClick.bind(this, "pathogen")}
              ref="pathogenTab"
              className={this.state.tabActive === "pathogen" ? "active" : ""}>
            Pathogen
          </li>
        </ul>
      </div>
      <div className="content-column">
        {this.state.tabActive === "vundle" &&
            <VundleInstructions github_url={this.props.github_url} />}
        {this.state.tabActive === "neoBundle" &&
            <NeoBundleInstructions github_url={this.props.github_url} />}
        {this.state.tabActive === "pathogen" &&
            <PathogenInstructions github_url={this.props.github_url} />}
      </div>
    </div>;
  }
});

// This is the category link and edit widget on the details page.
var Category = React.createClass({
  getInitialState: function() {
    return {
      categories: []
    };
  },

  componentDidMount: function() {
    fetchAllCategories(function(categories) {
      if (this.isMounted()) {
        this.setState({categories: categories});
      }
    }.bind(this));
    this.addBootstrapTooltips();
  },

  componentWillUnmount: function() {
    $(this.getDOMNode()).find('[title]').tooltip('destroy');
  },

  componentDidUpdate: function() {
    this.addBootstrapTooltips();
  },

  addBootstrapTooltips: function() {
    _.delay(function() {
      $(this.getDOMNode()).find('[title]')
        .tooltip('destroy')
        .tooltip({
          animation: false,
          container: 'body'
        });
    }.bind(this), 200);
  },

  onCategoryOptionClick: function(categoryId, e) {
    e.preventDefault();
    this.props.onCategoryChange(categoryId);
  },

  onCategoryClick: function(e) {
    if (this.props.editOnly) {
      e.preventDefault();
      this.refs.editBtn.getDOMNode().click();
    }
  },

  render: function() {
    var categoryElements = _.chain(this.state.categories)
      .reject(function(category) { return category.id === "uncategorized"; })
      .map(function(category) {
        return <li key={category.id}>
          <a title={category.description} data-placement="left" href="#"
              className="category-item"
              onClick={this.onCategoryOptionClick.bind(this, category.id)}>
            <i className={"category-icon " + category.icon}></i>
            {category.name}
          </a>
        </li>;
      }.bind(this));

    var category = _.findWhere(this.state.categories,
        {id: this.props.category}) || {};

    return <div className="category-select">
      <a title={category.description} data-placement="left"
          className={category.id + " category-link"}
          href={this.props.editOnly ? "#" : "/?q=cat:" + category.id}
          onClick={this.onCategoryClick}>
        <i className={category.icon + " category-icon"}></i> {category.name}
      </a>

      <div className="dropdown">
        <a ref="editBtn" className="dropdown-toggle" data-toggle="dropdown"
            data-target="#">
          <i className="icon-edit"></i>
        </a>
        <ul className="dropdown-menu pull-right">
          <li className="disabled">
            <a className="select-heading">Change category</a>
          </li>
          {categoryElements}
        </ul>
      </div>
    </div>;
  }
});

// This is the tags widget on the details page.
var Tags = React.createClass({
  getInitialState: function() {
    return {
      isEditing: false,
      allTags: {}
    };
  },

  componentDidMount: function() {
    this.fetchAllTags();
  },

  componentDidUpdate: function() {
    if (this.refs && this.refs.tagInput) {
      var $input = $(this.refs.tagInput.getDOMNode());
      if (!this.props.editOnly) {
        $input.focus();
      }
      this.initTypeahead($input);
    }
  },

  initTypeahead: function($input) {
    var allTags = this.state.allTags;

    var sortTagsByCount = function(items) {
      return _.sortBy(items, function(tag) {
        return -allTags[tag].count;
      });
    };

    // Uses Bootstrap's lightweight typeahead:
    // http://getbootstrap.com/2.3.2/javascript.html#typeahead
    $input.typeahead({
      source: _.keys(allTags),

      sorter: function(items) {
        var exactMatches = [];
        var prefixMatches = [];
        var otherMatches = [];
        var lowerCaseQuery = this.query.toLowerCase();

        // Group matches into exact matches, prefix matches, and remaining
        _.each(items, function(tag) {
          var lowerCaseTag = tag.toLowerCase();
          if (lowerCaseTag === lowerCaseQuery) {
            exactMatches.push(tag);
          } else if (startsWith(lowerCaseTag, lowerCaseQuery)) {
            prefixMatches.push(tag);
          } else {
            otherMatches.push(tag);
          }
        });

        return sortTagsByCount(exactMatches).concat(
            sortTagsByCount(prefixMatches), sortTagsByCount(otherMatches));
      },

      highlighter: function(item) {
        var Typeahead = $.fn.typeahead.Constructor;
        var tagName = capitalizeFirstLetter(item);
        var highlighted = Typeahead.prototype.highlighter.call(this,
            _.escape(tagName));
        return highlighted + "<span class=\"count\">&times; " +
            allTags[item].count + "</span>";
      },

      updater: function(item) {
        return capitalizeFirstLetter(item);
      }
    });
  },

  fetchAllTags: function() {
    if (!_.isEmpty(allTags)) {
      this.setState({allTags: allTags});
      return;
    }

    $.getJSON("/api/tags", function(data) {
      allTags = {};
      _.each(data, function(tag) {
        allTags[tag.id] = tag;
      });
      this.setState({allTags: allTags});
    }.bind(this));
  },

  onEditBtnClick: function() {
    this.setState({isEditing: true});
  },

  onDoneBtnClick: function() {
    this.setState({isEditing: false});
  },

  onRemoveBtnClick: function(tag, e) {
    this.props.onTagsChange(_.without(this.props.tags, tag));
  },

  onKeyUp: function(e) {
    var key = e.keyCode;
    if (key === 13 /* enter */ || key === 9 /* tab */ ||
        key === 188 /* comma */) {
      var $input = $(this.refs.tagInput.getDOMNode());
      // TODO(david): This needs to use autocomplete
      var tagId = $input.val().replace(/,$/, "").toLowerCase();
      if (!tagId) {
        return;
      }
      $input.val("");
      this.props.onTagsChange(this.props.tags.concat(tagId));
    }
  },

  onKeyDown: function(e) {
    var key = e.keyCode;
    if (key === 13 /* enter */) {
      e.preventDefault();  // Prevent unintended form submission
    }
  },

  render: function() {
    var MAX_TAGS = 4;
    var isEditing = this.state.isEditing || this.props.editOnly;

    var actionBtn;
    if (isEditing) {
      actionBtn = <button type="button"
          onClick={this.onDoneBtnClick} className="action-btn done-btn">
        <i className="icon-check"></i> Done
      </button>;
    } else {
      actionBtn = <button type="button"
          onClick={this.onEditBtnClick} className="action-btn edit-btn">
        <i className="icon-edit"></i> Edit
      </button>;
    }

    var tags = _.map(this.props.tags, function(tag) {
      // TODO(david): Should get tag name from map of tags that we send down.
      var tagName = capitalizeFirstLetter(tag);
      return <li key={tag} className="tag">
        <a className="tag-link" href={"/?q=tag:" + encodeURIComponent(tag)}>
          {tagName}
        </a>
        <i onClick={this.onRemoveBtnClick.bind(this, tag)}
            className="icon-remove-sign remove-btn"></i>
      </li>;
    }.bind(this));

    // TODO(david): Tags should be colored appropriately
    return <div className={"tags-select" + (isEditing ? " editing" : "")}>
      <h3 className="tags-label">Tags</h3>
      <ul className="tags-list">{tags}</ul>
      {isEditing && this.props.tags.length < MAX_TAGS &&
          <input ref="tagInput" onKeyDown={this.onKeyDown}
              onKeyUp={this.onKeyUp} type="text"
              maxLength="12" className="tag-input" placeholder="Add tag" />}
      {!this.props.editOnly && actionBtn}
    </div>;
  }
});

var Markdown = React.createClass({
  render: function() {
    var html = this.props.children || '';
    return <div dangerouslySetInnerHTML={{__html: marked(html)}} />;
  }
});

var Plaintext = React.createClass({
  render: function() {
    // TODO(david): Linkify <a> tags
    // TODO(david): Linkify "vimscript #2136" references (e.g. surround-vim'
    //     vim.org long description)
    return <div className={"plain " + (this.props.className || '')}>
      {this.props.children}
    </div>;
  }
});

// Permalink page with more details about a plugin.
var PluginPage = React.createClass({
  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {
    this.fetchPlugin();
    window.addEventListener("keydown", this.onWindowKeyDown, false);

    this.tagXhrQueue = $.Deferred();
    this.tagXhrQueue.resolve();
  },

  componentWillUnmount: function() {
    window.removeEventListener("keydown", this.onWindowKeyDown, false);
  },

  fetchPlugin: function() {
    $.getJSON("/api/plugins/" + this.props.params.slug, function(data) {
      this.setState(data);

      // Save in localStorage that this plugin has been visited.
      if (store.enabled) {
        var pluginStore = store.get("plugin-" + data.slug) || {};
        pluginStore.hasVisited = true;
        store.set("plugin-" + data.slug, pluginStore);
      }
    }.bind(this));
  },

  // TODO(david): Maybe use keypress?
  onWindowKeyDown: function(e) {
    var tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") {
      return;
    }

    var key = e.keyCode;
    var direction;
    var gPressed = (key === G_KEYCODE && !e.altKey && !e.ctrlKey &&
        !e.shiftKey && !e.metaKey);

    if (key === J_KEYCODE || key === K_KEYCODE) {
      // Scroll page in small increments with j/k.
      direction = (key === J_KEYCODE ? 1 : -1);
      window.scrollBy(0, direction * 100);
    } else if (key === U_KEYCODE || key === D_KEYCODE) {
      // Scroll page in large increments with u/d.
      direction = (key === D_KEYCODE ? 1 : -1);
      window.scrollBy(0, direction * 400);
    } else if (key === G_KEYCODE && e.shiftKey) {
      // Scroll to bottom of page with shift+G.
      window.scrollTo(0, $(document).height());
    } else if (this.gLastPressed && gPressed) {
      // Scroll to top of page with gg (or by holding down g (yes this is what
      // Vim does as well -- TIL)).
      window.scrollTo(0, 0);
    }

    this.gLastPressed = gPressed;
  },

  onCategoryChange: function(categoryId) {
    this.setState({category: categoryId});

    $.ajax({
      url: "/api/plugins/" + this.props.params.slug + "/category/" +
        categoryId,
      type: "PUT"
    });
  },

  // TODO(david): Should we adopt the "handleTagsChange" naming convention?
  onTagsChange: function(tags) {
    var newTags = _.uniq(tags);
    this.setState({tags: newTags});

    // We queue up AJAX requests to avoid race conditions on the server.
    var self = this;
    this.tagXhrQueue.done(function() {
      $.ajax({
        url: "/api/plugins/" + self.props.params.slug + "/tags",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({tags: newTags}),
        success: function() {
          self.tagXhrQueue.resolve();
        }
      });
    });
  },

  render: function() {
    // TODO(david): Need to also scrape the link to the archive download (for
    //     the manual install mode).
    var longDesc = this.state.github_readme || this.state.vimorg_long_desc;
    var installDetails = this.state.vimorg_install_details;

    // TODO(david): Handle rst filetype
    var readmeFilename = (
        this.state.github_readme_filename || '').toLowerCase();
    var longDescType = "plain";
    if (_.contains(["md", "markdown", "mkd", "mkdn"],
        readmeFilename.split(".").pop())) {
      longDescType = "markdown";
    } else if (readmeFilename === "readme") {
      longDescType = "mono";
    }

    var vimOrgUrl = this.state.vimorg_id &&
        ("http://www.vim.org/scripts/script.php?script_id=" +
        encodeURIComponent(this.state.vimorg_id));

    return <div className="plugin-page">
      <Plugin plugin={this.state} />

      <div className="row-fluid">
        <div className="span9 dates">
          <div className="row-fluid">
            <div className="span6">
              <h3 className="date-label">Created</h3>
              <div className="date-value">
                {moment(this.state.created_at * 1000).fromNow()}
              </div>
            </div>
            <div className="span6">
              <h3 className="date-label">Updated</h3>
              <div className="date-value">
                {moment(this.state.updated_at * 1000).fromNow()}
              </div>
            </div>
          </div>
        </div>
        <div className="span3 links">
          <a href={vimOrgUrl || "#"} target="_blank" className={"vim-link" +
              (vimOrgUrl ? "" : " disabled")}>
            <i className="vim-icon dark"></i>
            <i className="vim-icon light"></i>
            Vim.org
          </a>
          <a href={this.state.github_url || "#"} target="_blank" className={
              "github-link" + (this.state.github_url ? "" : " disabled")}>
            <i className="github-icon dark"></i>
            <i className="github-icon light"></i>
            GitHub
          </a>
        </div>
      </div>

      <div className="row-fluid">
        <div className="span9">
          <Install github_url={this.state.github_url} />
        </div>
        <div className="span3">
          <div className="row-fluid">
            <div className="span12">
              <Category category={this.state.category}
                  onCategoryChange={this.onCategoryChange} />
            </div>
          </div>
          <div className="row-fluid">
            <div className="span12">
              <Tags tags={this.state.tags} onTagsChange={this.onTagsChange} />
            </div>
          </div>
        </div>
      </div>

      {(longDesc || installDetails) &&
        <div className="row-fluid long-desc-container">
          <div className="long-desc">
            {longDescType === "markdown" && <Markdown>{longDesc}</Markdown>}
            {longDescType === "mono" &&
                <Plaintext className="mono">{longDesc}</Plaintext>}
            {longDescType === "plain" && <Plaintext>{longDesc}</Plaintext>}
            {!!installDetails &&
              <div>
                <h2>Installation</h2>
                <Plaintext>{installDetails}</Plaintext>
              </div>
            }
          </div>
        </div>
      }

    </div>;
  }
});

var PluginListPage = React.createClass({
  // TODO(david): What happens if user goes to non-existent page?
  // TODO(david): Update title so that user has meaningful history entries.

  getInitialState: function() {
    return this.getStateFromProps(this.props);
  },

  componentWillReceiveProps: function(nextProps) {
    // TODO(david): pushState previous results so we don't re-fetch. Or, set up
    //     a jQuery AJAX hook to cache all GET requests!!!! That will help with
    //     so many things!!! (But make sure not to exceed a memory threshold.)
    this.setState(this.getStateFromProps(nextProps));
  },

  onSearchFocus: function() {
    this.refs.pluginList.unselect();
  },

  onSearchBlur: function() {
    this.refs.pluginList.select();
  },

  onSearchChange: function(query) {
    this.setState({
      searchQuery: query,
      currentPage: 1
    });
    this.refs.pluginList.unselect();
  },

  getStateFromProps: function(props) {
    var queryParams = props.query;
    var currentPage = +(queryParams.p || 1);

    return {
      currentPage: currentPage,
      searchQuery: queryParams.q || ""
    };
  },

  updateUrlFromState: function() {
    var queryObject = {};

    if (this.state.currentPage !== 1) {
      queryObject.p = this.state.currentPage;
    }

    if (this.state.searchQuery) {
      queryObject.q = this.state.searchQuery;
    }

    // TODO(alpert): Probably don't want to make a new history entry for each
    // char when typing slowly into the search box
    transitionTo("plugin-list", null, queryObject);
  },

  onPluginsFetched: function() {
    // Update the URL when the page content has been updated if necessary.
    if (!_.isEqual(this.getStateFromProps(this.props), this.state)) {
      this.updateUrlFromState();
    }

    // Scroll to top
    window.scrollTo(0, 0);
  },

  onPageChange: function(page) {
    this.setState({currentPage: page});
  },

  render: function() {
    return <div>
      <SearchBox searchQuery={this.state.searchQuery}
          onChange={this.onSearchChange} onFocus={this.onSearchFocus}
          onBlur={this.onSearchBlur} />
      <div className="keyboard-tips">
        Tip: use <code>/</code> to search,{' '}
        <code>J</code>/<code>K</code> to navigate,{' '}
        <code>N</code>/<code>P</code> to flip pages
      </div>
      <PluginList ref="pluginList" searchQuery={this.state.searchQuery}
          currentPage={this.state.currentPage}
          onPluginsFetched={this.onPluginsFetched}
          onPageChange={this.onPageChange} />
    </div>;
  }
});

// TODO(david): Form validation on submit! Not done right now because we
//     currently just save this raw data to be manually reviewed.
var SubmitPage = React.createClass({
  getInitialState: function() {
    return {
      tags: [],
      category: "uncategorized"
    };
  },

  onTagsChange: function(tags) {
    this.setState({tags: _.uniq(tags)});
  },

  onCategoryChange: function(category) {
    this.setState({category: category});
  },

  render: function() {
    return <div className="submit-page">
      <h1>Submit plugin</h1>
      <form className="form-horizontal" action="/api/submit" method="POST">
        <div className="control-group">
          <label className="control-label" htmlFor="name-input">Name</label>
          <div className="controls">
            <input type="text" name="name" id="name-input"
                placeholder="e.g. Fugitive" />
          </div>
        </div>
        <div className="control-group">
          <label className="control-label" htmlFor="author-input">
            Author
          </label>
          <div className="controls">
            <input type="text" name="author" id="author-input"
                placeholder="e.g. Tim Pope" />
          </div>
        </div>
        <div className="control-group">
          <label className="control-label" htmlFor="github-input">
            GitHub link (optional)
          </label>
          <div className="controls">
            <input type="text" name="github-link" id="github-input"
                placeholder="e.g. https://github.com/tpope/vim-fugitive" />
          </div>
        </div>
        <div className="control-group">
          <label className="control-label" htmlFor="vimorg-input">
            Vim.org link (optional)
          </label>
          <div className="controls">
            <input type="text" name="vimorg-link" id="vimorg-input"
                placeholder={"e.g. " +
                    "http://www.vim.org/scripts/script.php?script_id=2975"} />
          </div>
        </div>
        <div className="control-group">
          <label className="control-label" htmlFor="category-input">
            Category
          </label>
          <div className="controls">
            <Category category={this.state.category} editOnly={true}
                onCategoryChange={this.onCategoryChange} />
          </div>
        </div>
        <div className="control-group">
          <label className="control-label" htmlFor="tags-input">
            Tags (up to four keywords for search)
          </label>
          <div className="controls">
            <Tags tags={this.state.tags} editOnly={true}
                onTagsChange={this.onTagsChange} />
          </div>
        </div>
        <div className="control-group">
          <div className="controls">
            <p className="other-info-blurb">
              All other information, including descriptions, will be
              automatically extracted from the GitHub or Vim.org link.
            </p>
          </div>
        </div>
        <div className="control-group">
          <div className="controls">
            <button type="submit">
              Submit
              <span className="right-arrow">{"\u2192"}</span>
            </button>
          </div>
        </div>
        <input type="hidden" name="category"
            value={this.state.category} />
        <input type="hidden" name="tags"
            value={JSON.stringify(this.state.tags)} />
      </form>
    </div>;
  }
});

var ThanksForSubmittingPage = React.createClass({
  render: function() {
    return <div className="thanks-for-submitting-page">
      <div className="thanks-box">
        <h1>Thanks!</h1>
        <p className="message">
          Thank you for submitting a plugin! It will be reviewed shortly.
        </p>
      </div>
    </div>;
  }
});

var AboutPage = React.createClass({
  render: function() {
    return <div className="about-page">

      <div className="long-desc-container long-desc">
        <h1>About</h1>
        <p>
          Vim Awesome wants to be a comprehensive, accurate, and up-to-date
          directory of Vim plugins.
        </p>
        <p>
          Many recent Vim plugins are announced on Hacker News or specialized
          boards, and have since become widely used. But how does a new user
          find out about these? We wanted to solve that problem and others
          with Vim Awesome &mdash; <strong> an open-sourced community resource
          for discovering new and popular Vim plugins </strong>.
        </p>

        <img className="vim-cleaner-img" src="/static/img/vim-cleaner.png" />
        <h2>Huh? Vim, the bathroom cleaner?</h2>
        <p>
          Yes, Vim is a cleaning product! But it's also a popular text editor
          pre-installed on many Unix systems. Because it's highly extensible,
          there have been thousands of plugins written for it.
        </p>
        <p>
          As of 2014, it is highly recommended to install plugins with
          a plugin manager such as
          {' '}<a target="_blank" href="https://github.com/gmarik/vundle">
            Vundle
          </a>,
          {' '}<a target="_blank" href="https://github.com/Shougo/neobundle.vim">
            NeoBundle
          </a>, or
          {' '}<a target="_blank" href="https://github.com/tpope/vim-pathogen">
            Pathogen
          </a>.
        </p>

        <h2>Where does the data come from?</h2>
        <p>
          GitHub, Vim.org, and user submissions.
        </p>
        <p>
          On GitHub there are more than 30 000 repos that are
          development environment configurations, commonly called
          {' '}<em>dotfiles</em>. From these repos we can extract{' '}
          <a href="https://github.com/divad12/dotfiles/blob/master/.vimrc#L23"
              target="_blank">
            references to Vim plugins (as Git URIs)
          </a>,
          particularly when plugin managers are used.
        </p>
        <p>
          Although there are orders of magnitude more Vim users than public
          dotfiles repos on GitHub, it is still a useful source of relative
          usage data.
        </p>

        <h2>Contribute?</h2>
        <p>
          Why, thank you! There are lots of things you can do to help out:
          <ul>
            <li>
              Tackle a{' '}
              <a href="https://github.com/divad12/vim-awesome/issues?labels=easyfix&amp;state=open">
                starter issue on GitHub
              </a> (or report an issue!).
            </li>
            <li>
              Categorize and tag some of{' '}
              <a href="/?q=cat:uncategorized">
                these plugins
              </a>.
            </li>
            <li>
              <a href="/submit">
                Submit
              </a>{' '}
              new plugins.
            </li>
            <li>
              Share this site if you find it useful! :)
            </li>
          </ul>
        </p>

        <h2>Acknowledgements</h2>
        <p>
          Thank you Ethan Schoonover for use of the
          {' '}<a target="_blank" href="http://ethanschoonover.com/solarized">
            Solarized
          </a>{' '}
          colour scheme.
        </p>
        <p>
          Much inspiration for this website, both conception and design, came
          from <a target="_blank" href="http://unheap.com">unheap.com</a>,
          a resource for browsing jQuery plugins.
        </p>
        <p>
          Built with
          {' '}<a target="_blank" href="http://facebook.github.io/react/">
            React
          </a>, a JavaScript library for building UIs, and
          {' '}<a target="_blank" href="http://rethinkdb.com/">
            RethinkDB
          </a>, a document-oriented database.
        </p>
      </div>
    </div>;
  }
});

var Page = React.createClass({
  render: function() {
    return <div className="page-container">
      <Sidebar />
      <div className="content">
        {this.props.activeRoute}
        <WipNotice />
        <Footer />
      </div>
    </div>;
  }
});

var routes = <Route handler={Page} location="history">
  <Route name="plugin-list" path="/" handler={PluginListPage} />
  <Route name="plugin" path="plugin/:slug" handler={PluginPage} />
  <Route name="submit" handler={SubmitPage} />
  <Route name="thanks-for-submitting" handler={ThanksForSubmittingPage} />
  <Route name="about" handler={AboutPage} />
</Route>;
React.renderComponent(routes, document.body);

// Hijack internal nav links to use router to navigate between pages
// Adapted from https://gist.github.com/tbranyen/1142129
$(document).on("click", "a", function(evt) {
  if (evt.which === 2 ||  // middle click
      evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) {
    return;
  }
  var href = $(this).attr("href");
  var protocol = this.protocol;

  // Only hijack URL to use router if it's relative (internal link) and not a
  // hash fragment.
  if (href && href.substr(0, protocol.length) !== protocol &&
      href[0] !== '#') {
    evt.preventDefault();
    transitionToPath(this.pathname + this.search, true);

    // Scroll to top. Chrome has this weird issue where it will retain the
    // current scroll position, even if it's beyond the document's height.
    window.scrollTo(0, 0);
  }
});
