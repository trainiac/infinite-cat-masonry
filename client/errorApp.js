import Vue from 'vue'
import App from 'components/ErrorApp'

export default function createErrorApp(state) {
  return new Vue({
    name: 'Root',
    computed: {
      errorType() {
        return state.errorType
      },
    },
    render: createElement => {
      return createElement(App)
    },
  })
}
