const fs = require('fs');
const humps = require('humps');

const _raw = Symbol();

const defaultOptions = {};

const identity = value => value;

const ConfConfError = function (message) {
	this.message = message;
};

const ConfConf = class {
	constructor(raw) {
		this[_raw] = raw;
	}

	config(name, optionsOrFilter, filter) {
		let options;

		if (typeof optionsOrFilter === 'function') {
			options = defaultOptions;
			filter = optionsOrFilter;
		} else {
			options = optionsOrFilter || defaultOptions;
			filter = filter || identity;
		}

		const rawName = options.from || humps.decamelize(name).toUpperCase();
		const rawValue = this[_raw][rawName];

		if ((rawValue === undefined) && (options.default === undefined)) {
			throw new ConfConfError(`Missing value for \`${name}\``);
		} else if (options.enum && !options.enum.includes(rawValue)) {
			throw new ConfConfError(`Value for \`${name}\` must be one of ${options.enum.join(', ')}`);
		} else {
			this[name] = filter(rawValue || options.default);
		}
	}

	static configure(rawOrSetup, setup) {
		let raw;

		if (typeof rawOrSetup === 'function') {
			raw = process.env;
			setup = rawOrSetup;
		} else {
			raw = rawOrSetup || process.env;
			setup = setup || identity;
		}

		const reply = new ConfConf(raw);
		setup(reply);
		return reply;
	}
};

module.exports = ConfConf;
