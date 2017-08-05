const humps = require('humps');

const rawValues = Symbol('raw values');

const defaultOptions = {};

const identity = value => value;

const ConfConfError = function (message) {
	this.message = message;
};

const ConfConf = class {
	constructor(raw) {
		this[rawValues] = raw;
	}

	config(name, optionsOrFilter, filter) {
		let options;
		let doFilter;

		if (typeof optionsOrFilter === 'function') {
			options = defaultOptions;
			doFilter = optionsOrFilter;
		} else {
			options = optionsOrFilter || defaultOptions;
			doFilter = filter || identity;
		}

		const rawName = options.from || humps.decamelize(name).toUpperCase();
		const rawValue = this[rawValues][rawName] || options.ifUndefined;

		if (rawValue === undefined) {
			throw new ConfConfError(`Missing value for \`${name}\``);
		}

		if (options.set && !options.set.includes(rawValue)) {
			throw new ConfConfError(`Value for \`${name}\` must be one of ${options.set.join(', ')}`);
		}

		this[name] = doFilter(rawValue);
	}

	static configure(rawOrSetup, setup) {
		let raw;
		let doSetup;

		if (typeof rawOrSetup === 'function') {
			raw = process.env;
			doSetup = rawOrSetup;
		} else {
			raw = rawOrSetup || process.env;
			doSetup = setup || identity;
		}

		const reply = new ConfConf(raw);
		doSetup(reply);
		return reply;
	}
};

module.exports = ConfConf;
