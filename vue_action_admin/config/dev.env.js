'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',

  //开发环境
  ADMIN_API: '"http://localhost:8607/action-admin"',
  PICTURE_API: '"http://localhost:8607/action-picture"',
  WEB_API: '"http://localhost:8607/action-web"',
  Search_API: '"http://localhost:8607/action-search"',
  Spider_API: '"http://localhost:8607/action-spider"',
  FILE_API: '"http://localhost:8600/"',
  BLOG_WEB_URL: '"http://localhost:9527"',
  SOLR_API: '"http://localhost:8080/solr"',
  ELASTIC_SEARCH: '"http://localhost:5601"',
})
