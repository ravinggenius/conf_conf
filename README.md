## ConfConf

ConfConf is a shameless port of a [Ruby gem](https://rubygems.org/gems/conf_conf) by the same name to Node. It is meant to be used with environment variables, but it also accepts flat raw configuration object.


### Usage

Use ConfConf to verify that your application is properly configured, with canonical names and no undefined values. The resulting object is a plain JavaScript object.

```javascript
// config.js

import { configure } from 'conf_conf';

export default configure(process.env, {
	databaseUrl: {},
	nodeEnv: { ifUndefined: 'development' }
});
```

---

Here's a run-down of all supported options.

```javascript
// config.js

import { configure } from 'conf_conf';

export default configure(process.env, {
	// by default `fooBar` will be assigned whatever value is in `process.env.FOO_BAR`
	// if `process.env.FOO_BAR` is `undefined`, an error will be thrown
	fooBar: {},

	// rename env keys if you like
	foo: { from: 'FOO_BAR' },

	// all values are required to be NOT `undefined`
	// provide a reasonable default for development with `ifUndefined`
	// if no default value is appropriate for development, use `.env-*` files (see Advanced)
	nodeEnv: { ifUndefined: 'development' },

	// normally environment variables are strings. if you need some other type, use `filter`
	port: { filter: port => parseInt(port, 10) }

	// if the value should be taken from a pre-determined list, you can do that too
	// an error will be thrown if `logLevel` isn't in `set`
	logLevel: { set: [ 'debug', 'info', 'warn', 'error' ] }

	minifyAssets: { ifUndefined: 'false', filter: minify => minify === 'true' }
});
```

---

If you need the configuration values to be nested, you can pass the same options to `valueFor`. Note that you can pass `null` as the first argument if you are providing `from`, but be warned that any error messages won't be as useful, so this isn't recommended.

```javascript
// config.js

import { valueFor } from 'conf_conf';

const v = valueFor(process.env);

export default {
	database: {
		host: v('host', { from: 'DB_HOST', ifUndefined: 'localhost' }),
		username: v('username', { from: 'DB_USER' }),
		password: v('password', { from: 'DB_PASSWORD' }),
		name: v('name', { from: 'DB_DATABASE', ifUndefined: 'foo_development' }),
	},
	nodeEnv: v('nodeEnv', { ifUndefined: 'development' })
}
```


### Advanced

You can combine with [dotenv](https://www.npmjs.com/package/dotenv) to define values you don't want in source control.

```
# .env

DATABASE_URL=postgres://root@localhost:5432/foo_development
```

```javascript
// config.js

import { configure } from 'conf_conf';
import { config } from 'dotenv';

config();

export default configure(process.env, {
	// we can use `ifUndefined` here, as this value may be different for every developer
	apiKey: {}
});
```

---

If you commonly need different sets of variables (maybe for `development` versus `test`), just tell `dotenv` where to look:

```javascript
// config.js

import { configure } from 'conf_conf';
import { config } from 'dotenv';

config({
	path: `${__dirname}/.env-${process.env.NODE_ENV || 'development'}`,
	silent: process.env.NODE_ENV === 'production'
});

export default configure({
	// ...
});
```

### License

ConfConf is released under the [MIT license](http://opensource.org/licenses/MIT).
