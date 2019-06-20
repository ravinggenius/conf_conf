const { decamelize } = require('humps');

const RAW_VALUES = Symbol('RAW_VALUES');

const identity = value => value;

class ConfConfError extends Error {
	constructor(...etc) {
		super(...etc);

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ConfConfError);
		}

		this.name = 'ConfConfError';
	}
}

const normalize = (optionsOrFinalize) => {
	if (typeof optionsOrFinalize === 'function') {
		return { finalize: optionsOrFinalize };
	} else {
		return optionsOrFinalize;
	}
};

const configBoolean = fallback => ({
	fallback,
	finalize: value => value === 'true',
	set: [
		'true',
		'false'
	]
});
module.exports.configBoolean = configBoolean;

const configDynamic = source => ({
	source
});
module.exports.configDynamic = configDynamic;

const configInteger = fallback => ({
	fallback,
	finalize: value => Number.parseInt(value, 10)
});
module.exports.configInteger = configInteger;

const configString = fallback => ({
	fallback
});
module.exports.configString = configString;

const valueFor = raw => (name, {
	fallback,
	finalize = identity,
	set,
	source = decamelize(name).toUpperCase()
}) => {
	let reply;

	if (typeof source === 'function') {
		reply = source(raw);
	} else if (raw[source] !== undefined) {
		reply = raw[source];
	} else if (fallback !== undefined) {
		reply = fallback;
	} else {
		throw new ConfConfError(`Missing value for \`${name}\`. Expected \`process.env.${source}\` to be defined`);
	}

	if (set && !set.includes(reply)) {
		throw new ConfConfError(`Value for \`${name}\` must be one of ${set.join(', ')}`);
	}

	return finalize(reply);
};
module.exports.valueFor = valueFor;

const configure = (raw, descriptions) => {
	const base = { [RAW_VALUES]: raw };
	const v = valueFor(raw);

	const reply = Object.entries(descriptions).reduce((memo, [ name, options ]) => ({
		...memo,
		[name]: v(name, normalize(options))
	}), base);

	return Object.freeze(reply);
};
module.exports.configure = configure;
