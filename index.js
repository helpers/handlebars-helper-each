'use strict';

var extend = require('extend-shallow');

module.exports = function(context, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    cb(new Error('each is a block helper that expects a context as the first argument (array or object)'));
    return;
  }

  if (typeof cb !== 'function') {
    cb = function(err, result) {
      if (err) throw err;
      return result;
    };
  }

  var fn = options.fn;
  var inverse = options.inverse;
  var i = 0;
  var result = '';
  var data;
  var contextPath;

  function execIteration(field, index, last) {
    if (data) {
      data.key = field;
      data.index = index;
      data.first = index === 0;
      data.last = !!last;

      if (contextPath) {
        data.contextPath = contextPath + field;
      }
    }

    result = result + fn(context[field], {
      data: data,
      blockParams: blockParams([context[field], field], [contextPath + field, null])
    });
  }

  try {
    if (options.data && options.ids) {
      contextPath = appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (typeof context === 'function') {
      context = context.call(this);
    }

    if (options.data) {
      data = createFrame(options.data);
    }

    if (context && typeof context === 'object') {
      if (Array.isArray(context)) {
        for (var j = context.length; i < j; i++) {
          if (i in context) {
            execIteration(i, i, i === context.length - 1);
          }
        }
      } else {
        var priorKey;

        for (var key in context) {
          if (context.hasOwnProperty(key)) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey !== undefined) {
              execIteration(priorKey, i - 1);
            }
            priorKey = key;
            i++;
          }
        }

        if (priorKey !== undefined) {
          execIteration(priorKey, i - 1, true);
        }
      }
    }

    if (i === 0) {
      result = inverse(this);
    }
  } catch (err) {
    return cb(err);
  }

  return cb(null, result);
};

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function createFrame(object) {
  var frame = extend({}, object);
  frame._parent = object;
  return frame;
}
