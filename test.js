var expect = require('expect.js');

var ConfConf = require('./index');

describe('ConfConf', function () {
	var raw = {
		'FOO_NAME': '42'
	};

	describe('.configure()', function () {
		it('wraps an object with ConfConf', function () {
			var expected = ConfConf.configure(raw);

			expect(expected).to.be.a(ConfConf);
			expect(expected).to.eql(new ConfConf(raw));
		});

		it('defers to environment variables', function () {
			expect(ConfConf.configure()).to.eql(new ConfConf(process.env));
		});

		it('yields to a function before returning', function () {
			var func = function (conf) {
				expect(conf).to.be.a(ConfConf);

				conf.config('foo', { from: 'FOO_NAME' });
			};

			var expected = (function () {
				var reply = new ConfConf(raw);
				func(reply);
				return reply;
			})();

			expect(ConfConf.configure(raw, func)).to.eql(expected);
		});
	});

	describe('#config()', function () {
		var conf;

		beforeEach(function () {
			conf = new ConfConf(raw);
		});

		it('derives the raw name from the friendly name', function () {
			expect(conf).to.not.have.property('fooName');

			conf.config('fooName');

			expect(conf).to.have.property('fooName');
			expect(conf.fooName).to.equal('42');
		});

		describe('options', function () {
			it('allows renaming the raw name', function () {
				expect(conf).to.not.have.property('foo');

				conf.config('foo', { from: 'FOO_NAME' });

				expect(conf).to.have.property('foo');
			});

			it('is not required when given a default', function () {
				conf.config('other', { default: 'not 42' });

				expect(conf.other).to.equal('not 42');
			});
		});

		describe('filter', function () {
			it('passes the value through a function before assigning', function () {
				conf.config('fooName', function (value) {
					return parseInt(value, 10) * 2;
				});

				expect(conf.fooName).to.equal(84);
			});
		});

		describe('options and filter', function () {
			var filter = function (value) {
				return parseInt(value, 10);
			};

			it('respects options before passing through the filter', function () {
				conf.config('foo', { from: 'FOO_NAME' }, filter);
				expect(conf.foo).to.equal(42);

				conf.config('other', { default: '21' }, filter);
				expect(conf.other).to.equal(21);
			});
		});

		describe('when the value is not found', function () {
			it('raises an exception', function () {
				expect(function () {
					conf.config('other');
				}).to.throwException(function (e) {
					expect(e.message).to.equal('Missing value for `other`');
				});
			});
		});
	});
});
