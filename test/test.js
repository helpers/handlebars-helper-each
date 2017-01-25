'use strict';

require('mocha');
var hbs = require('handlebars');
var assemble = require('assemble');
var assert = require('assert');
var each = require('..');
var app;

describe('handlebars-helper-each', function() {
  beforeEach(function() {
    app = assemble();
    app.page('foo.hbs', {content: 'this is foo', data: {title: 'Foo'}});
    app.page('bar.hbs', {content: 'this is bar', data: {title: 'Bar'}});
    app.page('baz.hbs', {content: 'this is baz', data: {title: 'Baz'}});
  });

  it('should work as a sync helper', function(cb) {
    app.helper('each', each);
    app.page('index.hbs', {
      content: [
        '{{#pages}}',
        '{{#each items as |item|}}',
        '<li>{{item.data.title}}</li>',
        '{{/each}}',
        '{{/pages}}',
      ].join('\n'), data: {title: 'ABC'}});

    app.render('index.hbs', function(err, view) {
      if (err) {
        cb(err);
        return;
      }

      assert.equal('<li>Foo</li>\n<li>Bar</li>\n<li>Baz</li>\n<li>ABC</li>', view.content.trim());
      cb();
    });
  });

  it('should work as an async helper', function(cb) {
    app.asyncHelper('each', each);
    app.page('index.hbs', {
      content: [
        '{{#pages}}',
        '{{#each items as |item|}}',
        '<li>{{item.data.title}}</li>',
        '{{/each}}',
        '{{/pages}}',
      ].join('\n'), data: {title: 'ABC'}});

    app.render('index.hbs', function(err, view) {
      if (err) {
        cb(err);
        return;
      }

      assert.equal('<li>Foo</li>\n<li>Bar</li>\n<li>Baz</li>\n<li>ABC</li>', view.content.trim());
      cb();
    });
  });

  it('should work with objects', function(cb) {
    app.asyncHelper('each', each);

    var context = {items: {foo: 'one', bar: 'two', baz: 'three'}};
    app.page('index.hbs', {
      content: [
        '{{#each items as |item|}}',
        '<li>{{item}}</li>',
        '{{/each}}',
      ].join('\n')});

    app.render('index.hbs', context, function(err, view) {
      if (err) {
        cb(err);
        return;
      }

      var expected = '<li>one</li>\n<li>two</li>\n<li>three</li>';
      assert.equal(view.content.trim(), expected);
      cb();
    });
  });

  it('should work with handlebars', function() {
    hbs.registerHelper('each', each);

    var context = {items: {foo: 'one', bar: 'two', baz: 'three'}};
    var fn = hbs.compile([
      '{{#each items as |value key|}}',
      '<li>{{key}}: {{value}}</li>',
      '{{/each}}',
    ].join('\n'));

    var expected = '<li>foo: one</li>\n<li>bar: two</li>\n<li>baz: three</li>';
    assert.equal(expected, fn(context).trim());
  });
});
