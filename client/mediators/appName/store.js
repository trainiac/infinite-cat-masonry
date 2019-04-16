import { vueReset, vueUpdate, vueMerge } from 'utils/vue'

function getInitialState() {
  return {
    foo: 'bar',
  }
}

export default {
  namespaced: true,
  state() {
    return getInitialState()
  },
  mutations: {
    set(state, { key, value }) {
      vueSet(state, key, value)
    },
    update(state, { key, updates }) {
      vueUpdate(state, key, updates)
    },
    merge(state, { key, updates }) {
      vueReset(state, key, updates)
    },
    reset(state, updates) {
      vueReset(state, getInitialState())
    },
  },
}
