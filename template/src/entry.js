{{#router}}
import router from './router';
{{else}}
import Vue from 'vue';
import weex from 'weex-vue-render';

weex.init(Vue);
{{/router}}

{{#router}}
/* weex initialized here, please do not move this line */
const App = require('@/index.vue');
/* eslint-disable no-new */
new Vue(Vue.util.extend({el: '#root', router}, App));
router.push('/');
{{/router}}

