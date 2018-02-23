{{#router}}
import router from './router';
import App from './index.vue';
{{/router}}

{{#router}}
/* eslint-disable no-new */
new Vue(Vue.util.extend({el: '#root', router}, App));
router.push('/');
{{/router}}

