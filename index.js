const fs = require('fs');
const humps = require('humps');

const _raw = Symbol();

const defaultOptions = {};

const defaultFilter = function (value) {
	return value;
};

const ConfConf = function (raw) {
	this[_raw] = raw;
};

ConfConf.prototype.enum = function (name, optionsOrFilter, filter) {
};

ConfConf.prototype.config = function (name, optionsOrFilter, filter) {
	let options;

	if (typeof optionsOrFilter === 'function') {
		options = defaultOptions;
		filter = optionsOrFilter;
	} else {
		options = optionsOrFilter || defaultOptions;
		filter = filter || defaultFilter;
	}

	const rawName = options.from || humps.decamelize(name).toUpperCase();
	const rawValue = this[_raw][rawName];

	if ((rawValue === undefined) && (options.default === undefined)) {
		throw new ConfConfError('Missing value for `' + name + '`');
	} else if (options.enum && (options.enum.indexOf(rawValue) === -1)) {
		throw new ConfConfError('Value for `' + name + '` must be one of ' + options.enum.join(', '));
	} else {
		this[name] = filter(rawValue || options.default);
	}
};

const ConfConfError = function (message) {
	this.message = message;
};

ConfConf.configure = function (rawOrSetup, setup) {
	let raw;

	if (typeof rawOrSetup === 'function') {
		raw = process.env;
		setup = rawOrSetup;
	} else {
		raw = rawOrSetup || process.env;
		setup = setup || defaultFilter;
	}

	const reply = new ConfConf(raw);
	setup(reply);
	return reply;
};

ConfConf.conventional = function (envLocalPath, setup) {
	let envLocal;

	if (fs.existsSync(envLocalPath)) {
	  envLocal = require(envLocalPath);
	} else {
	  envLocal = {};
	}

	const nodeEnv = process.env.NODE_ENV || 'development';

	const raw = Object.assign({}, envLocal.common, envLocal[nodeEnv], process.env);

	return ConfConf.configure(raw, setup);
};

module.exports = ConfConf;
