// Generated by CoffeeScript 1.6.3
var Cookie, Cookies, HTML, Tough, assert,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

assert = require("assert");

HTML = require("jsdom").dom.level3.html;

Tough = require("tough-cookie");

Cookie = Tough.Cookie;

module.exports = Cookies = (function(_super) {
  __extends(Cookies, _super);

  function Cookies() {}

  Cookies.prototype.dump = function() {
    var cookie, _i, _len, _ref, _results;
    _ref = this.sort(Tough.cookieCompare);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cookie = _ref[_i];
      _results.push(process.stdout.write(cookie.toString() + "\n"));
    }
    return _results;
  };

  Cookies.prototype.serialize = function(domain, path) {
    return this.select({
      domain: domain,
      path: path
    }).map(function(cookie) {
      return cookie.cookieString();
    }).join("; ");
  };

  Cookies.prototype.select = function(identifier) {
    var cookies;
    cookies = this.filter(function(cookie) {
      return cookie.TTL() > 0;
    });
    if (identifier.name) {
      cookies = cookies.filter(function(cookie) {
        return cookie.key === identifier.name;
      });
    }
    if (identifier.path) {
      cookies = cookies.filter(function(cookie) {
        return Tough.pathMatch(identifier.path, cookie.path);
      });
    }
    if (identifier.domain) {
      cookies = cookies.filter(function(cookie) {
        return Tough.domainMatch(identifier.domain, cookie.domain);
      });
    }
    return cookies.sort(function(a, b) {
      return b.domain.length - a.domain.length;
    }).sort(Tough.cookieCompare);
  };

  Cookies.prototype.set = function(params) {
    var cookie, deleteIfExists;
    cookie = new Cookie({
      key: params.name,
      value: params.value,
      domain: params.domain || "localhost",
      path: params.path || "/"
    });
    if (params.expires) {
      cookie.setExpires(params.expires);
    } else if (params.hasOwnProperty("max-age")) {
      cookie.setMaxAge(params["max-age"]);
    }
    cookie.secure = !!params.secure;
    cookie.httpOnly = !!params.httpOnly;
    deleteIfExists = this.filter(function(c) {
      return c.key === cookie.key && c.domain === cookie.domain && c.path === cookie.path;
    })[0];
    this["delete"](deleteIfExists);
    if (cookie.TTL() > 0) {
      this.push(cookie);
    }
  };

  Cookies.prototype["delete"] = function(cookie) {
    var index;
    index = this.indexOf(cookie);
    if (~index) {
      return this.splice(index, 1);
    }
  };

  Cookies.prototype.deleteAll = function() {
    return this.length = 0;
  };

  Cookies.prototype.update = function(httpHeader, domain, path) {
    var cookie, deleteIfExists, _i, _len, _ref;
    if (httpHeader.constructor === Array) {
      httpHeader = httpHeader.join(",");
    }
    _ref = httpHeader.split(/,(?=[^;,]*=)|,$/);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cookie = _ref[_i];
      cookie = Cookie.parse(cookie);
      if (cookie) {
        cookie.domain || (cookie.domain = domain);
        cookie.path || (cookie.path = Tough.defaultPath(path));
        deleteIfExists = this.filter(function(c) {
          return c.key === cookie.key && c.domain === cookie.domain && c.path === cookie.path;
        })[0];
        this["delete"](deleteIfExists);
        if (cookie.TTL() > 0) {
          this.push(cookie);
        }
      }
    }
  };

  return Cookies;

})(Array);

HTML.HTMLDocument.prototype.__defineGetter__("cookie", function() {
  return this.window.browser.cookies.select({
    domain: this.location.hostname,
    path: this.location.pathname
  }).filter(function(cookie) {
    return !cookie.httpOnly;
  }).map(function(cookie) {
    return "" + cookie.key + "=" + cookie.value;
  }).join("; ");
});

HTML.HTMLDocument.prototype.__defineSetter__("cookie", function(cookie) {
  return this.window.browser.cookies.update(cookie.toString(), this.location.hostname, this.location.pathname);
});
