const { decamelize } = require('humps');

const RAW_VALUES = Symbol('RAW_VALUES');

const identity = value => value;

const ConfConfError = function (message) {
	this.message = message;
};

const normalize = (optionsOrFilter) => {
	if (typeof optionsOrFilter === 'function') {
		return { filter: optionsOrFilter };
	} else {
		return optionsOrFilter;
	}
};

const valueFor = raw => (name, {
	filter = identity,
	from = decamelize(name).toUpperCase(),
	ifUndefined,
	set
}) => {
	let reply;

	if (raw[from] !== undefined) {
		reply = raw[from];
	} else if (ifUndefined !== undefined) {
		reply = ifUndefined;
	} else {
		throw new ConfConfError(`Missing value for \`${name}\``);
	}

	if (set && !set.includes(reply)) {
		throw new ConfConfError(`Value for \`${name}\` must be one of ${set.join(', ')}`);
	}

	return filter(reply);
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
