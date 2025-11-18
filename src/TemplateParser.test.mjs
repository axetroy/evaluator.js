import test from 'node:test';
import assert from 'node:assert/strict';
import { TemplateParser } from './TemplateParser.js';

test('empty template -> []', () => {
  const parser = new TemplateParser();
  const tokens = parser.parse('');
  assert.deepEqual(tokens, []);
});

test('plain text only', () => {
  const parser = new TemplateParser();
  const tokens = parser.parse('hello');
  assert.equal(tokens.length, 1);
  assert.equal(tokens[0].type, 'text');
  assert.equal(tokens[0].value, 'hello');
  assert.equal(tokens[0].start, 0);
  assert.equal(tokens[0].end, 5);
});

test('text + expression + text', () => {
  const parser = new TemplateParser();
  const tokens = parser.parse('a{{b}}c');
  assert.equal(tokens.length, 3);

  assert.equal(tokens[0].type, 'text');
  assert.equal(tokens[0].value, 'a');
  assert.equal(tokens[0].start, 0);
  assert.equal(tokens[0].end, 1);

  assert.equal(tokens[1].type, 'expression');
  assert.equal(tokens[1].value, 'b');
  // positions include markers
  assert.equal(tokens[1].start, 1);
  assert.equal(tokens[1].end, 6);
  assert.equal(tokens[1].contentStart, 3);
  assert.equal(tokens[1].contentEnd, 4);

  assert.equal(tokens[2].type, 'text');
  assert.equal(tokens[2].value, 'c');
  assert.equal(tokens[2].start, 6);
  assert.equal(tokens[2].end, 7);
});

test('unclosed expression is treated as text tail', () => {
  const parser = new TemplateParser();
  const tokens = parser.parse('a{{b c');
  assert.equal(tokens.length, 2);
  assert.equal(tokens[0].type, 'text');
  assert.equal(tokens[0].value, 'a');
  assert.equal(tokens[1].type, 'text');
  assert.equal(tokens[1].value, '{{b c');
});

test('skip empty/whitespace-only expression', () => {
  const parser = new TemplateParser();
  const tokens = parser.parse('a{{   }}b');
  assert.equal(tokens.length, 2);
  assert.equal(tokens[0].type, 'text');
  assert.equal(tokens[0].value, 'a');
  assert.equal(tokens[1].type, 'text');
  assert.equal(tokens[1].value, 'b');
});

test('preserveWhitespace = false trims text tokens and drops empty ones', () => {
  const parser = new TemplateParser({ preserveWhitespace: false });
  const tokens = parser.parse('  a  {{  x + 1  }}  b  ');
  assert.equal(tokens.length, 3);
  assert.deepEqual(tokens.map(t => t.type), ['text', 'expression', 'text']);
  assert.deepEqual(tokens.map(t => t.value), ['a', 'x + 1', 'b']);
});

test('includePositions = false removes positional fields', () => {
  const parser = new TemplateParser({ includePositions: false });
  const tokens = parser.parse('a{{b}}c');
  assert.equal(tokens.length, 3);

  for (const t of tokens) {
    assert.equal('start' in t, false);
    assert.equal('end' in t, false);
    assert.equal('contentStart' in t, false);
    assert.equal('contentEnd' in t, false);
  }
});

test('custom delimiters', () => {
  const parser = new TemplateParser({ expressionStart: '<%', expressionEnd: '%>' });
  const tokens = parser.parse('hi<% a + b %>!');
  assert.equal(tokens.length, 3);
  assert.equal(tokens[1].type, 'expression');
  assert.equal(tokens[1].value, 'a + b');
  // indices: h(0)i(1)<(2)%(3) ...(content starts at 4) ...(%) at 11 >(12) !(13)
  assert.equal(tokens[1].start, 2);
  assert.equal(tokens[1].end, 13);
  assert.equal(tokens[1].contentStart, 4);
  assert.equal(tokens[1].contentEnd, 11);
});

test('static parse works like instance parse', () => {
  const tokens = TemplateParser.parse('x{{y}}z');
  assert.equal(tokens.length, 3);
  assert.deepEqual(tokens.map(t => t.type), ['text', 'expression', 'text']);
  assert.deepEqual(tokens.map(t => t.value), ['x', 'y', 'z']);
});
