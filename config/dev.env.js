'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  TRANS_API: '"/api"',
  ZLIBRARY_API: '"/zlibrary"'
})
