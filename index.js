'use strict';

var typeOf = require('kind-of');
var extend = require('extend-shallow');
var utils = require('handlebars-utils');

module.exports = function(context, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    cb(new Error('each is a block helper that expects a context as the first argument (array or object)'));
    return;
  }

  let contextPath;
  let result = '';
  let data;

  function execIteration(key, index, last) {
    if (data) {
      data.key = key;
      data.index = index;
      data.first = index === 0;
      data.last = !!last;

      if (contextPath) {
        data.contextPath = contextPath + key;
      }
    }

    let val = context[key];

    result = result + options.fn(val, {
      data: data,
      blockParams: utils.blockParams([val, key], [contextPath + key, null])
    });
  }

  try {
    if (options.data && options.ids) {
      contextPath = utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (typeof context === 'function') {
      context = context.call(this);
    }

    if (options.data) {
      data = utils.createFrame(options.data);
    }

    let arr = context;
    let isObject = typeOf(context) === 'object';
    if (isObject) {
      arr = Object.keys(context);
    }

    let len = arr.length;
    if (len === 0) {
      result = options.inverse(this);
    } else {
      for (let i = 0; i < len; i++) {
        execIteration(isObject ? arr[i] : i, i, i === len - 1);
      }
    }

  } catch (err) {
    if (typeof cb !== 'function') {
      throw err;
    }
    cb(err);
    return;
  }

  if (typeof cb !== 'function') {
    return result;
  }

  cb(null, result);
};
