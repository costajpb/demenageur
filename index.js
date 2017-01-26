#! /usr/bin/env node
var require_cwd = require('require-cwd');
var resolve = require('resolve').sync;
var fs = require('fs-extra');
var chokidar = require('chokidar');
var path = require('path');

var demenageur = {
  init: function () {
    var noWatch = process.argv[2];
    if (!noWatch) {
      this.watcher = chokidar.watch()
        .on('ready', function () {
          this._warn('demenageur is watching moveable files for you.\n');
        }.bind(this))
        .on('change', function (path, stats) {
          this.demenager(path);
        }.bind(this))
      ;
    }
    this.demenager();
  },
  _isDir: function (p) {
    return !path.extname(p);
  },
  _belongsTo: function (parent, child) {
    return path.relative(parent, child).indexOf('../') !== 0;
  },
  _getAbsolutePath: function (p) {
    if (path.isAbsolute(p)) {
      return p;
    } else {
      var dirname = path.dirname(resolve(this._curDepName, { basedir: process.cwd() }));
      var absPath = path.resolve(dirname, p);
      return absPath;
    }
  },
  _warn: function (message, debug) {
    console.log('demenageur >>> [' + this._curDepName + '] ' + message);
  },
  demenager: function (fileOrDir) {
    var comp, descriptor, dest, src, files;
    var cfg = require(process.cwd() + '/package.json').config.demenageur;
    for (var name in cfg) {
      this._curDepName = name;
      try {
        descriptor = require_cwd(this._curDepName);
        if (descriptor.demenageur) {
          descriptor = descriptor.demenageur;
        } else if (!fileOrDir) {
          this._warn("Your file doesn't contain a 'demenageur' key. It will be required in a future major release.");
        }
        comp = cfg[this._curDepName];
        for (var type in comp) {
          src = this._getAbsolutePath(descriptor[type]);
          dest = comp[type];
          if (this._isDir(dest) && !this._isDir(src)) {
            dest = path.join(dest, path.basename(src));
          }
          if (!fileOrDir || fileOrDir == src || (this._isDir(src) && this._belongsTo(src, fileOrDir))) {
            try {
              fs.copySync(src, dest);
              this._warn(type + ' copied to ' + path.resolve(dest), true);
            } catch (err) {
              this._warn(src + ' was not found or could not be rehoused.');
            }
          }

          if (!fileOrDir && this.watcher) {
            this.watcher.add(src);
          }
        }
      } catch (err) {
        if (!fileOrDir) {
          this._warn('demenageur could not find dependency, but it will try to move on.\n');
        }
      }
    }
  }
};

demenageur.init();
