// Generated by CoffeeScript 1.4.0
var appPath, docpadConfig, getCategoryName, getLabelName, getLinkName, getName, getProjectName, humanize, moment, pathUtil, rootPath, strUtil, textData, _,
  __hasProp = {}.hasOwnProperty;

pathUtil = require('path');

_ = require('underscore');

moment = require('moment');

strUtil = require('underscore.string');

rootPath = __dirname + '/../..';

appPath = __dirname;

textData = require(appPath + '/text');

getName = function(a, b) {
  var _ref, _ref1;
  if (b === null) {
    return (_ref = textData[b]) != null ? _ref : humanize(b);
  } else {
    return (_ref1 = textData[a][b]) != null ? _ref1 : humanize(b);
  }
};

getProjectName = function(project) {
  return getName('projectNames', project);
};

getCategoryName = function(category) {
  return getName('categoryNames', category);
};

getLinkName = function(link) {
  return getName('linkNames', link);
};

getLabelName = function(label) {
  return getName('labelNames', label);
};

humanize = function(text) {
  if (text == null) {
    text = '';
  }
  return strUtil.humanize(text.replace(/^[\-0-9]+/, '').replace(/\..+/, ''));
};

docpadConfig = {
  rootPath: rootPath,
  outPath: rootPath + '/site/out',
  srcPath: rootPath + '/site/src',
  regenerateEvery: 1000 * 60 * 60,
  templateData: {
    underscore: _,
    strUtil: strUtil,
    moment: moment,
    text: textData,
    projects: require(appPath + '/projects'),
    trainings: require(appPath + '/trainings'),
    site: {
      url: "http://bevry.me",
      title: "Bevry - Node.js, Backbone.js & JavaScript Consultancy in Sydney, Australia",
      description: "We're a Node.js, Backbone.js and JavaScript consultancy in Sydney Australia with a focus on empowering developers. We've created History.js one of the most popular javascript projects in the world, and DocPad an amazing Node.js Content Management System. We’re also working on setting up several Startup Hostels all over the world, enabling entreprenuers to travel, collaborate, and live their dream lifestyles cheaper than back home.",
      keywords: "bevry, bevryme, balupton, benjamin lupton, docpad, history.js, node, node.js, javascript, coffeescript, startup hostel, query engine, queryengine, backbone.js, cson",
      styles: ['/styles/style.css'],
      scripts: ["/vendor/jquery.js", "/vendor/log.js", "/vendor/jquery.scrollto.js", "/vendor/modernizr.js", "/vendor/history.js", "/vendor/historyjsit.js", "/scripts/script.js"]
    },
    getName: getName,
    getProjectName: getProjectName,
    getCategoryName: getCategoryName,
    getLinkName: getLinkName,
    getLabelName: getLabelName,
    getPreparedTitle: function() {
      if (this.document.pageTitle !== false && this.document.title) {
        return "" + (this.document.pageTitle || this.document.title) + " | " + this.site.title;
      } else if (this.document.pageTitle === false || (this.document.title != null) === false) {
        return this.site.title;
      }
    },
    getPreparedDescription: function() {
      return this.document.description || this.site.description;
    },
    getPreparedKeywords: function() {
      return this.site.keywords.concat(this.document.keywords || []).join(', ');
    }
  },
  collections: {
    learn: function(database) {
      return database.findAllLive({
        relativeOutDirPath: {
          $startsWith: 'learn'
        },
        body: {
          $ne: ""
        }
      }, [
        {
          projectDirectory: 1,
          categoryDirectory: 1,
          filename: 1
        }
      ]).on('add', function(document) {
        var a, category, categoryDirectory, categoryName, layout, name, pageTitle, project, projectDirectory, projectName, slug, standalone, title, url, urls;
        a = document.attributes;
        layout = 'doc';
        standalone = true;
        projectDirectory = pathUtil.basename(pathUtil.resolve(pathUtil.dirname(a.fullPath) + '/..'));
        project = projectDirectory.replace(/[\-0-9]+/, '');
        projectName = getProjectName(project);
        categoryDirectory = pathUtil.basename(pathUtil.dirname(a.fullPath));
        category = categoryDirectory.replace(/^[\-0-9]+/, '');
        categoryName = getCategoryName(category);
        name = a.basename.replace(/^[\-0-9]+/, '');
        url = "/learn/" + project + "-" + name;
        slug = "/" + project + "/" + name;
        urls = [slug];
        title = "" + (a.title || humanize(name));
        pageTitle = "" + title + " | " + projectName;
        document.set({
          title: title,
          pageTitle: pageTitle,
          layout: layout,
          projectDirectory: projectDirectory,
          project: project,
          projectName: projectName,
          categoryDirectory: categoryDirectory,
          category: category,
          categoryName: categoryName,
          slug: slug,
          url: url,
          urls: urls,
          standalone: standalone
        });
        return document.getMeta().set({
          slug: slug,
          url: url,
          urls: urls
        });
      });
    },
    pages: function(database) {
      return database.findAllLive({
        relativeOutDirPath: 'pages'
      }, [
        {
          filename: 1
        }
      ]);
    },
    posts: function(database) {
      return database.findAllLive({
        relativeOutDirPath: 'posts'
      }, [
        {
          date: -1
        }
      ]).on('add', function(document) {
        return document.set({
          ignored: true,
          write: false,
          author: 'balupton'
        });
      });
    }
  },
  events: {
    generateBefore: function(opts, next) {
      var balUtil, config, docpad, repoKey, repoValue, repos, tasks;
      if (opts.reset === false) {
        return next();
      }
      balUtil = require('bal-util');
      docpad = this.docpad;
      config = docpad.getConfig();
      repos = {
        'docpad-documentation': {
          path: pathUtil.join(config.documentsPaths[0], 'learn', 'docs', 'docpad'),
          url: 'git://github.com/bevry/docpad-documentation.git'
        }
      };
      tasks = new balUtil.Group(next);
      for (repoKey in repos) {
        if (!__hasProp.call(repos, repoKey)) continue;
        repoValue = repos[repoKey];
        tasks.push(repoValue, function(complete) {
          return balUtil.initOrPullGitRepo(balUtil.extend({
            remote: 'origin',
            branch: 'master',
            output: true,
            next: complete
          }, this));
        });
      }
      tasks.async();
    },
    writeAfter: function(opts, next) {
      var balUtil, config, docpad, siteUrl, sitemap, sitemapPath;
      balUtil = require('bal-util');
      docpad = this.docpad;
      config = docpad.getConfig();
      sitemap = [];
      sitemapPath = config.outPath + '/sitemap.txt';
      siteUrl = config.templateData.site.url;
      docpad.getCollection('html').forEach(function(document) {
        if (document.get('sitemap') !== false && document.get('write') !== false && document.get('ignored') !== true && document.get('body')) {
          return sitemap.push(siteUrl + document.get('url'));
        }
      });
      return balUtil.writeFile(sitemapPath, sitemap.sort().join('\n'), next);
    },
    serverExtend: function(opts) {
      var docpad, express, server;
      server = opts.server, express = opts.express;
      docpad = this.docpad;
      return require(appPath + '/routes')({
        docpad: docpad,
        server: server,
        express: express
      });
    }
  }
};

module.exports = docpadConfig;
