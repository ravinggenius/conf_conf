var _ = require('lodash');
var humps = require('humps');

var defaultOptions = {};

var defaultFilter = function (value) {
	return value;
};

var ConfConf = function (raw) {
	this._raw = raw;
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

module.exports = ConfConf;
