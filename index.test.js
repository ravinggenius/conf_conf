/* global describe, it, beforeEach */

const expect = require('expect.js');

const ConfConf = require('./index');

describe('ConfConf', () => {
	const raw = {
		FOO_NAME: '42',
		BOOLEAN: 'true'
	};

	describe('.configure()', () => {
		it('wraps an object with ConfConf', () => {
			const expected = ConfConf.configure(raw);

			expect(expected).to.be.a(ConfConf);
			expect(expected).to.eql(new ConfConf(raw));
		});

		it('defers to environment variables', () => {
			expect(ConfConf.configure()).to.eql(new ConfConf(process.env));
		});

		it('yields to a function before returning', () => {
			const func = (conf) => {
				expect(conf).to.be.a(ConfConf);

				conf.config('foo', { from: 'FOO_NAME' });
			};

			const expected = (() => {
				const reply = new ConfConf(raw);
				func(reply);
				return reply;
			})();

			expect(ConfConf.configure(raw, func)).to.eql(expected);
		});
	});

	describe('#config()', () => {
		let conf;

		beforeEach(() => {
			conf = new ConfConf(raw);
		});

		it('derives the raw name from the friendly name', () => {
			expect(conf).to.not.have.property('fooName');

			conf.config('fooName');

			expect(conf).to.have.property('fooName');
			expect(conf.fooName).to.equal('42');
		});

		describe('options', () => {
			it('allows renaming the raw name', () => {
				expect(conf).to.not.have.property('foo');

				conf.config('foo', { from: 'FOO_NAME' });

				expect(conf).to.have.property('foo');
			});

			it('is not required when given a default', () => {
				conf.config('other', { ifUndefined: 'not 42' });

				expect(conf.other).to.equal('not 42');
			});

			it('restricts accepted values', () => {
				expect(() => {
					conf.config('boolean', { set: [ 'foo', 'bar', 'baz' ] });
				}).to.throwException((e) => {
					expect(e.message).to.equal('Value for `boolean` must be one of foo, bar, baz');
				});
			});

			it('restricts accepted values with a default', () => {
				conf.config('whatever', { ifUndefined: 'foo', set: [ 'foo', 'bar', 'baz' ] });

				expect(conf.whatever).to.equal('foo');
			});
		});

		describe('filter', () => {
			it('passes the value through a function before assigning', () => {
				conf.config('fooName', value => parseInt(value, 10) * 2);

				expect(conf.fooName).to.equal(84);
			});
		});

		describe('options and filter', () => {
			const filter = value => parseInt(value, 10);

			it('respects options before passing through the filter', () => {
				conf.config('foo', { from: 'FOO_NAME' }, filter);
				expect(conf.foo).to.equal(42);

				conf.config('other', { ifUndefined: '21' }, filter);
				expect(conf.other).to.equal(21);
			});
		});

		describe('when the value is not found', () => {
			it('raises an exception', () => {
				expect(() => {
					conf.config('other');
				}).to.throwException((e) => {
					expect(e.message).to.equal('Missing value for `other`');
				});
			});
		});
	});
});
