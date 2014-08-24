## ConfConf

ConfConf is a shameless port of a [Ruby gem](https://rubygems.org/gems/conf_conf) by the same name to Node. It is meant to be used with environment variables, but it also accepts flat raw configuration object.


### Usage

Use ConfConf to verify that your application is properly configured, with canonical names for required values.

```javascript
// config.js
module.exports = ConfConf.configure(process.env, function (conf) {
	// by default `conf.fooBar` will be assigned whatever value `process.env.FOO_BAR` has
	conf.config('fooBar');

	// rename env keys if you like
	conf.config('foo', { from: 'FOO_BAR' });

	// registered configs are required unless a default is given
	conf.config('nodeEnv', { default: 'development' });

	// baz is now boolean and defaults to false
	conf.config('baz', { default: 'false' }, function (baz) {
		return baz === 'true';
	});
});
```

```javascript
// app.js
var config = require('./config');
config.nodeEnv;
```


### License

ConfConf is released under the [MIT license](http://opensource.org/licenses/MIT).
