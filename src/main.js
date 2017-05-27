import Vue from 'vue'
import App from './App'

import store from '@/store'

global.window.store = store

Vue.config.productionTip = false

/* eslint-disable no-new */
global.window.app = new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
