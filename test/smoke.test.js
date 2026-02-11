const test = require('node:test');
const assert = require('node:assert/strict');

test('smoke: test harness runs', () => {
  assert.equal(1 + 1, 2);
});
