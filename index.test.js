/* global describe, it, beforeEach */

const expect = require('expect.js');

const { configure, valueFor } = require('./index');

describe('ConfConf', () => {
	const raw = {
		FOO_NAME: '42',
		BOOLEAN: 'true'
	};

	describe('configure()', () => {
		it('derives the raw name from the friendly name', () => {
			const config = configure(raw, {
				fooName: {}
			});

			expect(config).to.have.property('fooName');
			expect(config.fooName).to.equal('42');
		});

		describe('options', () => {
			it('allows renaming the raw name', () => {
				const config = configure(raw, {
					foo: { from: 'FOO_NAME' }
				});

				expect(config).to.have.property('foo');
			});

			it('is not required when given a default', () => {
				const config = configure(raw, {
					other: { ifUndefined: 'not 42' }
				});

				expect(config.other).to.equal('not 42');
			});

			it('restricts accepted values', () => {
				expect(() => {
					configure(raw, {
						boolean: { set: [ 'foo', 'bar', 'baz' ] }
					});
				}).to.throwException((e) => {
					expect(e.message).to.equal('Value for `boolean` must be one of foo, bar, baz');
				});
			});

			it('restricts accepted values with a default', () => {
				const config = configure(raw, {
					whatever: { ifUndefined: 'foo', set: [ 'foo', 'bar', 'baz' ] }
				});

				expect(config.whatever).to.equal('foo');
			});

			it('allows any value', () => {
				const config = configure(raw, {
					whatever: { ifUndefined: null }
				});

				expect(config.whatever).to.equal(null);
			});

			it('allows any value except undefined', () => {
				expect(() => {
					configure(raw, {
						whatever: { ifUndefined: undefined }
					});
				}).to.throwException((e) => {
					expect(e.message).to.equal('Missing value for `whatever`');
				});
			});
		});

		describe('filter', () => {
			it('passes the value through a function before assigning', () => {
				const config = configure(raw, {
					fooName: value => parseInt(value, 10) * 2
				});

				expect(config.fooName).to.equal(84);
			});
		});

		describe('options and filter', () => {
			const filter = value => parseInt(value, 10);

			it('respects options before passing through the filter', () => {
				const config = configure(raw, {
					foo: { filter, from: 'FOO_NAME' },
					other: { filter, ifUndefined: '21' }
				});

				expect(config.foo).to.equal(42);
				expect(config.other).to.equal(21);
			});
		});

		describe('when the value is not found', () => {
			it('raises an exception', () => {
				expect(() => {
					configure(raw, {
						other: {}
					});
				}).to.throwException((e) => {
					expect(e.message).to.equal('Missing value for `other`');
				});
			});
		});
	});

	describe('valueFor()', () => {
		it('normalizes a value for nested configurations', () => {
			const v = valueFor(raw);
			const value = v('fooName', {});

			expect(value).to.equal('42');
		});

		it('ignores invalid name when using `from`', () => {
			const v = valueFor(raw);
			const value = v(null, { from: 'FOO_NAME' });

			expect(value).to.equal('42');
		});
	});
});
