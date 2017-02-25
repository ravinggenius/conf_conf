## ConfConf

ConfConf is a shameless port of a [Ruby gem](https://rubygems.org/gems/conf_conf) by the same name to Node. It is meant to be used with environment variables, but it also accepts flat raw configuration object.


### Usage

Use ConfConf to verify that your application is properly configured, with canonical names for required values.

```javascript
// config.js
module.exports = ConfConf.configure(process.env, (conf) => {
	// by default `conf.fooBar` will be assigned whatever value `process.env.FOO_BAR` has
	conf.config('fooBar');

	// rename env keys if you like
	conf.config('foo', { from: 'FOO_BAR' });

	// registered configs are required unless a default is given
	conf.config('nodeEnv', { default: 'development' });

	// baz is now boolean and defaults to false
	conf.config('baz', { default: 'false' }, baz => baz === 'true');
});
```

```javascript
// app.js
const config = require('./config');
config.nodeEnv;
```


### Advanced

You can combine with [dotenv](https://www.npmjs.com/package/dotenv) to define values you don't want in source control. Just be sure to not commit `.env`.

```javascript
// config.js

// .env defines `DATABASE_URL`
require('dotenv').config();

module.exports = ConfConf.configure(process.env, (conf) => {
	// we don't want a `default` here, as it will be different for every developer
	conf.config('databaseURL');
});
```

```javascript
// .env
DATABASE_URL=postgres://root@localhost:5432/foo_development
```

If you commonly need different sets of variables (maybe for `development` versus `test`), just tell `dotenv` where to look:

```javascript
// config.js
require('dotenv').config({
	path: `${__dirname}/.env-${process.env.NODE_ENV || 'development'}`,
	silent: process.env.NODE_ENV === 'production'
});
```


### License

ConfConf is released under the [MIT license](http://opensource.org/licenses/MIT).
