var _ = require('lodash');
var fs = require('fs');
var humps = require('humps');

var defaultOptions = {};

var defaultFilter = function (value) {
	return value;
};

var ConfConf = function (raw) {
	this._raw = raw;
};

ConfConf.prototype.enum = function (name, optionsOrFilter, filter) {
};

ConfConf.prototype.config = function (name, optionsOrFilter, filter) {
	var options;

	if (typeof optionsOrFilter === 'function') {
		options = defaultOptions;
		filter = optionsOrFilter;
	} else {
		options = optionsOrFilter || defaultOptions;
		filter = filter || defaultFilter;
	}

	var rawName = options.from || humps.decamelize(name).toUpperCase();
	var rawValue = this._raw[rawName];

	if ((rawValue === undefined) && (options.default === undefined)) {
		throw new ConfConfError('Missing value for `' + name + '`');
	} else if (options.enum && (options.enum.indexOf(rawValue) === -1)) {
		throw new ConfConfError('Value for `' + name + '` must be one of ' + options.enum.join(', '));
	} else {
		this[name] = filter(rawValue || options.default);
	}
};

var ConfConfError = function (message) {
	this.message = message;
};

ConfConf.configure = function (rawOrSetup, setup) {
	var raw;

	if (typeof rawOrSetup === 'function') {
		raw = process.env;
		setup = rawOrSetup;
	} else {
		raw = rawOrSetup || process.env;
		setup = setup || defaultFilter;
	}

	return _.tap(new ConfConf(raw), setup);
};

ConfConf.conventional = function (envLocalPath, setup) {
	var envLocal;

	if (fs.existsSync(envLocalPath)) {
	  envLocal = require(envLocalPath);
	} else {
	  envLocal = {};
	}

	var nodeEnv = process.env.NODE_ENV || 'development';

	var raw = _.merge({}, envLocal.common, envLocal[nodeEnv], process.env);

	return ConfConf.configure(raw, setup);
};

module.exports = ConfConf;
