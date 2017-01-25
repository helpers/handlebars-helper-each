'use strict';

require('mocha');
var assemble = require('assemble');
var assert = require('assert');
var each = require('..');
var app;

describe('helper-assemble-collection', function() {
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
});
