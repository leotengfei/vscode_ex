module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const vscode = __webpack_require__(1);
	const DefinitionProvider = __webpack_require__(2);

	module.exports = {
	  activate (context) {
	    const config = vscode.workspace.getConfiguration('javascript.commonjs.resolve');

	    context.subscriptions.push(
	      vscode.languages.registerDefinitionProvider(
	        config.languages, new DefinitionProvider(config)
	      )
	    );
	  },
	  deactivate () { }
	};


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("vscode");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const moduleExtractor = __webpack_require__(3);
	const resolveModule = __webpack_require__(4);
	const path = __webpack_require__(9);
	const vscode = __webpack_require__(1);

	class DefinitionProvider {

	  constructor (options) {
	    this._options = Object.assign({}, options);
	  }

	  provideDefinition (document, position) {
	    const line = document.lineAt(position.line);

	    if (line.isEmpty) {
	      return null;
	    }

	    return moduleExtractor
	      .findAll(line.text)
	      .then(modules => this.filterRequest(modules, position))
	      .then(target => target && this.resolveModule(target, document))
	      .then(target => target && this.filterEs6(target))
	      .then(target => target && (new vscode.Location(vscode.Uri.file(target.resolved), new vscode.Range(0, 0, 1, 0))))
	      .catch(err => console.log(err) && Promise.resolve(null));
	  }

	  filterRequest (modules, position) {
	    return modules.find((item) => {
	      const moduleName = item.data[3];
	      const strStart = item.start + item.data[0].indexOf(moduleName);
	      const strEnd = strStart + moduleName.length;

	      item.type = ~item.data[1].indexOf('import') ? 'import' : 'require';

	      return position.character >= strStart && position.character <= strEnd;
	    });
	  }

	  resolveModule (target, document) {
	    if (!target) {
	      return Promise.reject();
	    }

	    return new Promise((resolve, reject) => {
	      const opts = this._options;
	      opts.basedir = path.dirname(document.fileName);

	      resolveModule(target.data[3], opts, (err, data) => {
	        if (err) {
	          return reject('File not found');
	        }

	        target.resolved = data;

	        return resolve(target);
	      });
	    });
	  }

	  filterEs6 (target) {
	    const moduleName = target.data[3];

	    if (target.type === 'import' && moduleName[0] === '.') {
	      const moduleWithoutRelativeDots = moduleName.replace(/^(\.+[\/\\])+/gi, '');

	      const testRe = new RegExp(`${moduleWithoutRelativeDots}(.js)?$`, 'i');

	      if (testRe.test(target.resolved)) {
	        return null;
	      }
	    }

	    return target;
	  }

	  dispose () {
	    // Nothing to do here;
	  }

	}

	module.exports = DefinitionProvider;


/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	const requireRe = /(require\s*\(\s*)(['"])(.*?[^\\])\2\s*\)/g;
	const importRe = /(import\s+(?:.*?\s+from\s+)?)(['"])(.*?[^\\])\2/g;

	module.exports = {
	  findAll: findAll
	};

	function findAll (text) {
	  return Promise.all([
	    findAllRegex(requireRe, text),
	    findAllRegex(importRe, text)
	  ]).then(data => {
	    let results = [];

	    data.forEach(item => results = results.concat(item));

	    return results;
	  });
	}

	function findAllRegex (expr, text) {
	  return new Promise((resolve, reject) => {
	    let match = expr.exec(text);
	    let result = [];

	    while (match !== null) {
	      try {
	        result.push({
	          start: match.index,
	          end: expr.lastIndex,
	          data: match
	        });
	      } catch (e) {}

	      match = expr.exec(text);
	    }

	    resolve(result);
	  });
	}




/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var core = __webpack_require__(5);
	exports = module.exports = __webpack_require__(7);
	exports.core = core;
	exports.isCore = function (x) { return core[x] };
	exports.sync = __webpack_require__(12);


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(6).reduce(function (acc, x) {
	    acc[x] = true;
	    return acc;
	}, {});


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = [
		"assert",
		"buffer_ieee754",
		"buffer",
		"child_process",
		"cluster",
		"console",
		"constants",
		"crypto",
		"_debugger",
		"dgram",
		"dns",
		"domain",
		"events",
		"freelist",
		"fs",
		"http",
		"https",
		"_linklist",
		"module",
		"net",
		"os",
		"path",
		"punycode",
		"querystring",
		"readline",
		"repl",
		"stream",
		"string_decoder",
		"sys",
		"timers",
		"tls",
		"tty",
		"url",
		"util",
		"vm",
		"zlib"
	];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var core = __webpack_require__(5);
	var fs = __webpack_require__(8);
	var path = __webpack_require__(9);
	var caller = __webpack_require__(10);
	var nodeModulesPaths = __webpack_require__(11);
	var splitRe = process.platform === 'win32' ? /[\/\\]/ : /\//;

	module.exports = function resolve (x, opts, cb) {
	    if (typeof opts === 'function') {
	        cb = opts;
	        opts = {};
	    }
	    if (!opts) opts = {};
	    if (typeof x !== 'string') {
	        return process.nextTick(function () {
	            cb(new Error('path must be a string'));
	        });
	    }
	    
	    var isFile = opts.isFile || function (file, cb) {
	        fs.stat(file, function (err, stat) {
	            if (err && err.code === 'ENOENT') cb(null, false)
	            else if (err) cb(err)
	            else cb(null, stat.isFile() || stat.isFIFO())
	        });
	    };
	    var readFile = opts.readFile || fs.readFile;
	    
	    var extensions = opts.extensions || [ '.js' ];
	    var y = opts.basedir || path.dirname(caller());
	    
	    opts.paths = opts.paths || [];
	    
	    if (/^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[\\\/])/.test(x)) {
	        var res = path.resolve(y, x);
	        if (x === '..') res += '/';
	        if (/\/$/.test(x) && res === y) {
	            loadAsDirectory(res, opts.package, onfile);
	        }
	        else loadAsFile(res, opts.package, onfile);
	    }
	    else loadNodeModules(x, y, function (err, n, pkg) {
	        if (err) cb(err)
	        else if (n) cb(null, n, pkg)
	        else if (core[x]) return cb(null, x);
	        else cb(new Error("Cannot find module '" + x + "' from '" + y + "'"))
	    });
	    
	    function onfile (err, m, pkg) {
	        if (err) cb(err)
	        else if (m) cb(null, m, pkg)
	        else loadAsDirectory(res, function (err, d, pkg) {
	            if (err) cb(err)
	            else if (d) cb(null, d, pkg)
	            else cb(new Error("Cannot find module '" + x + "' from '" + y + "'"))
	        })
	    }
	    
	    function loadAsFile (x, pkg, cb) {
	        if (typeof pkg === 'function') {
	            cb = pkg;
	            pkg = undefined;
	        }
	        
	        var exts = [''].concat(extensions);
	        load(exts, x, pkg)
			
			function load (exts, x, pkg) {
	            if (exts.length === 0) return cb(null, undefined, pkg);
	            var file = x + exts[0];
	            
	            if (pkg) onpkg(null, pkg)
	            else loadpkg(path.dirname(file), onpkg);
	            
	            function onpkg (err, pkg_, dir) {
	                pkg = pkg_;
	                if (err) return cb(err)
	                if (dir && pkg && opts.pathFilter) {
	                    var rfile = path.relative(dir, file);
	                    var rel = rfile.slice(0, rfile.length - exts[0].length);
	                    var r = opts.pathFilter(pkg, x, rel);
	                    if (r) return load(
	                        [''].concat(extensions.slice()),
	                        path.resolve(dir, r),
	                        pkg
	                    );
	                }
	                isFile(file, onex);
	            }
	            function onex (err, ex) {
	                if (err) cb(err)
	                else if (!ex) load(exts.slice(1), x, pkg)
	                else cb(null, file, pkg)
	            }
	        }
	    }
	    
	    function loadpkg (dir, cb) {
	        if (dir === '' || dir === '/') return cb(null);
	        if (process.platform === 'win32' && /^\w:[\\\/]*$/.test(dir)) {
	            return cb(null);
	        }
	        if (/[\\\/]node_modules[\\\/]*$/.test(dir)) return cb(null);
	        
	        var pkgfile = path.join(dir, 'package.json');
	        isFile(pkgfile, function (err, ex) {
	            // on err, ex is false
	            if (!ex) return loadpkg(
	                path.dirname(dir), cb
	            );
	            
	            readFile(pkgfile, function (err, body) {
	                if (err) cb(err);
	                try { var pkg = JSON.parse(body) }
	                catch (err) {}
	                
	                if (pkg && opts.packageFilter) {
	                    pkg = opts.packageFilter(pkg, pkgfile);
	                }
	                cb(null, pkg, dir);
	            });
	        });
	    }
	    
	    function loadAsDirectory (x, fpkg, cb) {
	        if (typeof fpkg === 'function') {
	            cb = fpkg;
	            fpkg = opts.package;
	        }
	        
	        var pkgfile = path.join(x, '/package.json');
	        isFile(pkgfile, function (err, ex) {
	            if (err) return cb(err);
	            if (!ex) return loadAsFile(path.join(x, '/index'), fpkg, cb);
	            
	            readFile(pkgfile, function (err, body) {
	                if (err) return cb(err);
	                try {
	                    var pkg = JSON.parse(body);
	                }
	                catch (err) {}
	                
	                if (opts.packageFilter) {
	                    pkg = opts.packageFilter(pkg, pkgfile);
	                }
	                
	                if (pkg.main) {
	                    if (pkg.main === '.' || pkg.main === './'){
	                        pkg.main = 'index'
	                    }
	                    loadAsFile(path.resolve(x, pkg.main), pkg, function (err, m, pkg) {
	                        if (err) return cb(err);
	                        if (m) return cb(null, m, pkg);
	                        if (!pkg) return loadAsFile(path.join(x, '/index'), pkg, cb);

	                        var dir = path.resolve(x, pkg.main);
	                        loadAsDirectory(dir, pkg, function (err, n, pkg) {
	                            if (err) return cb(err);
	                            if (n) return cb(null, n, pkg);
	                            loadAsFile(path.join(x, '/index'), pkg, cb);
	                        });
	                    });
	                    return;
	                }
	                
	                loadAsFile(path.join(x, '/index'), pkg, cb);
	            });
	        });
	    }
	    
	    function loadNodeModules (x, start, cb) {
	        (function process (dirs) {
	            if (dirs.length === 0) return cb(null, undefined);
	            var dir = dirs[0];
	            
	            var file = path.join(dir, '/', x);
	            loadAsFile(file, undefined, onfile);
	            
	            function onfile (err, m, pkg) {
	                if (err) return cb(err);
	                if (m) return cb(null, m, pkg);
	                loadAsDirectory(path.join(dir, '/', x), undefined, ondir);
	            }
	            
	            function ondir (err, n, pkg) {
	                if (err) return cb(err);
	                if (n) return cb(null, n, pkg);
	                process(dirs.slice(1));
	            }
	        })(nodeModulesPaths(start, opts));
	    }
	};


/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = function () {
	    // see https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
	    var origPrepareStackTrace = Error.prepareStackTrace;
	    Error.prepareStackTrace = function (_, stack) { return stack };
	    var stack = (new Error()).stack;
	    Error.prepareStackTrace = origPrepareStackTrace;
	    return stack[2].getFileName();
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var path = __webpack_require__(9);

	module.exports = function (start, opts) {
	    var modules = opts.moduleDirectory
	        ? [].concat(opts.moduleDirectory)
	        : ['node_modules']
	    ;

	    // ensure that `start` is an absolute path at this point,
	    // resolving against the process' current working directory
	    start = path.resolve(start);

	    var prefix = '/';
	    if (/^([A-Za-z]:)/.test(start)) {
	        prefix = '';
	    } else if (/^\\\\/.test(start)) {
	        prefix = '\\\\';
	    }

	    var splitRe = process.platform === 'win32' ? /[\/\\]/ : /\/+/;

	    var parts = start.split(splitRe);

	    var dirs = [];
	    for (var i = parts.length - 1; i >= 0; i--) {
	        if (modules.indexOf(parts[i]) !== -1) continue;
	        dirs = dirs.concat(modules.map(function(module_dir) {
	            return prefix + path.join(
	                path.join.apply(path, parts.slice(0, i + 1)),
	                module_dir
	            );
	        }));
	    }
	    if (process.platform === 'win32'){
	        dirs[dirs.length-1] = dirs[dirs.length-1].replace(":", ":\\");
	    }
	    return dirs.concat(opts.paths);
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var core = __webpack_require__(5);
	var fs = __webpack_require__(8);
	var path = __webpack_require__(9);
	var caller = __webpack_require__(10);
	var nodeModulesPaths = __webpack_require__(11);

	module.exports = function (x, opts) {
	    if (!opts) opts = {};
	    var isFile = opts.isFile || function (file) {
	        try { var stat = fs.statSync(file) }
	        catch (err) { if (err && err.code === 'ENOENT') return false }
	        return stat.isFile() || stat.isFIFO();
	    };
	    var readFileSync = opts.readFileSync || fs.readFileSync;
	    
	    var extensions = opts.extensions || [ '.js' ];
	    var y = opts.basedir || path.dirname(caller());

	    opts.paths = opts.paths || [];

	    if (/^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[\\\/])/.test(x)) {
	        var res = path.resolve(y, x);
	        if (x === '..') res += '/';
	        var m = loadAsFileSync(res) || loadAsDirectorySync(res);
	        if (m) return m;
	    } else {
	        var n = loadNodeModulesSync(x, y);
	        if (n) return n;
	    }
	    
	    if (core[x]) return x;
	    
	    throw new Error("Cannot find module '" + x + "' from '" + y + "'");
	    
	    function loadAsFileSync (x) {
	        if (isFile(x)) {
	            return x;
	        }
	        
	        for (var i = 0; i < extensions.length; i++) {
	            var file = x + extensions[i];
	            if (isFile(file)) {
	                return file;
	            }
	        }
	    }
	    
	    function loadAsDirectorySync (x) {
	        var pkgfile = path.join(x, '/package.json');
	        if (isFile(pkgfile)) {
	            var body = readFileSync(pkgfile, 'utf8');
	            try {
	                var pkg = JSON.parse(body);
	                if (opts.packageFilter) {
	                    pkg = opts.packageFilter(pkg, x);
	                }
	                
	                if (pkg.main) {
	                    var m = loadAsFileSync(path.resolve(x, pkg.main));
	                    if (m) return m;
	                    var n = loadAsDirectorySync(path.resolve(x, pkg.main));
	                    if (n) return n;
	                }
	            }
	            catch (err) {}
	        }
	        
	        return loadAsFileSync(path.join( x, '/index'));
	    }
	    
	    function loadNodeModulesSync (x, start) {
	        var dirs = nodeModulesPaths(start, opts);
	        for (var i = 0; i < dirs.length; i++) {
	            var dir = dirs[i];
	            var m = loadAsFileSync(path.join( dir, '/', x));
	            if (m) return m;
	            var n = loadAsDirectorySync(path.join( dir, '/', x ));
	            if (n) return n;
	        }
	    }
	};


/***/ }
/******/ ]);