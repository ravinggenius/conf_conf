## ConfConf

ConfConf was inspired by a [Ruby gem](https://rubygems.org/gems/conf_conf) of the same name. It provides a single source of truth for your application's configuration. Configure it in a file (typically `config.js`), and keep awkward `process.env.WHATEVER`s away from the rest of your source code.

Assumptions (see also https://12factor.net/config):

* You store your app's configuration in environment variables
* You want numbers and booleans to be `number` and `boolean`, *not* `string`
* You want to *know* your app is fully configured when it boots
* Configuration should be optimized for **`development`**, with environment overrides for any other runtime


### Usage

Use ConfConf to verify that your application is properly configured, with canonical names and no `undefined` values. The resulting object is a frozen JavaScript object. ConfConf is meant to be used with environment variables, but it also accepts a flat raw configuration object (handy for testing!). A tool like [@std/esm](https://www.npmjs.com/package/@std/esm) is recommended to enable modern module syntax.

```javascript
// config.js

import { configure } from 'conf_conf';

export default configure(process.env, {
	databaseUrl: {},
	nodeEnv: { fallback: 'development' }
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
	foo: { source: 'FOO_BAR' },

	// set a dynamic value
	// `env` is whatever you passed as the first argument to `configure`
	// the return value will still be verified against `set` and passed through `finalize`, so keep that in mind if you don't return a string
	isDev: { source: env => env.NODE_ENV !== 'production' },

	// all values are required to be NOT `undefined`
	// provide a reasonable default for development with `fallback`
	// if no default value is appropriate for development, use `*.env` files (see Advanced)
	nodeEnv: { fallback: 'development' },

	// normally environment variables are strings. if you need some other type, use `finalize`
	port: { finalize: port => Number.parseInt(port, 10) },

	// if you only need to specify `finalize`, it may be shortened:
	// port: port => Number.parseInt(port, 10),

	// if the value should be taken from a pre-determined list, you can do that too
	// an error will be thrown if `logLevel` isn't in `set`
	logLevel: { set: [ 'debug', 'info', 'warn', 'error' ] },

	// boolean value example
	minifyAssets: { fallback: 'false', finalize: minify => minify === 'true', set: [ 'true', 'false' ] }
});
```

Some helper functions that cover common use-cases are also available:

```javascript
import { configBoolean, configInteger, configString, configure } from 'conf_conf';

export default configure(process.env, {
	allowMultipleUsers: configBoolean('false'),

	baseUrl: configString('http://localhost:3000'),

	cookieSecret: configString('replace for production'),

	hashStrength: configInteger('12'),
```

---

If you need the configuration values to be nested, you can drop down a level and use `valueFor`. It returns a function that takes a `name` and the same options as above. Note that you can pass `null` as the first argument if you are providing `from` as an explicit string, but be warned that any error messages won't be as useful, so this isn't recommended.

```javascript
// config.js

import { valueFor } from 'conf_conf';

const v = valueFor(process.env);

export default {
	database: {
		host: v('host', { source: 'DB_HOST', fallback: 'localhost' }),
		username: v('username', { source: 'DB_USER' }),
		password: v('password', { source: 'DB_PASSWORD' }),
		name: v('name', { source: 'DB_DATABASE', fallback: 'foo_development' }),
	},
	nodeEnv: v('nodeEnv', { fallback: 'development' })
}
```


### Advanced

You can combine with [dotenv](https://www.npmjs.com/package/dotenv) to define values you don't want to keep in source control.

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
	// don't use `fallback` here, as this value should be different for each developer
	databaseUrl: {}
});
```

---

If you commonly need different sets of variables (maybe for `development` versus `test`), just tell `dotenv` where to look:

```javascript
// config.js

import { configure } from 'conf_conf';
import { config } from 'dotenv';
import { join } from 'path';

config({
	path: join(__dirname, `${process.env.NODE_ENV || 'development'}.env`)
});

export default configure({
	// ...
});
```

### License

ConfConf is released under the [MIT license](http://opensource.org/licenses/MIT).
