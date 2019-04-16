import Vue from 'vue'
import Vuex from 'vuex'
import { getRegisteredModules } from 'store/modulesManager'
Vue.use(Vuex)

export function createStore(initialState) {
  const storeConfig = {}
  storeConfig.mutations = {
    reset({ commit }) {
      // empty all resources from store
      const registeredModules = getRegisteredModules(store)
      const modNamespaces = Object.keys(registeredModules)
      modNamespaces.forEach(modNamespace => {
        if (registeredModules[modNamespace].reset) {
          commit(`${modNamespace}/reset`)
        }
      })
    },
  }
  if (initialState) {
    storeConfig.state = initialState
  }
  storeConfig.strict = process.env.NODE_ENV === 'development'
  const store = new Vuex.Store(storeConfig)
  return store
}
