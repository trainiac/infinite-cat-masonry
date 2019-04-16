function trackModule(mod, moduleName, namespace) {
  let moduleNamespace = moduleName
  if (namespace) {
    moduleNamespace = `${namespace}/${moduleName}`
  }

  if (process.env.NODE_ENV === 'development') {
    if (mod.state && !mod.mutations.reset) {
      throw new Error(
        `Module with namespace "${moduleNamespace}" has no reset mutation`
      )
    }
  }

  let trackedModules = {}
  if (mod.modules) {
    trackedModules = trackModules(mod.modules, moduleNamespace)
  }

  if (mod.namespaced) {
    trackedModules[moduleNamespace] = {
      reset: Boolean(mod.state),
    }
  }
  return trackedModules
}

export function registerModule(store, path, rawModule, options) {
  const trackedModules = trackModule(rawModule, path)
  assignRegisteredModules(store, trackedModules)
  return store.registerModule(path, rawModule, options)
}

export function hasModule(store, path) {
  if (store.$_registeredModules) {
    return path in store.$_registeredModules
  }
  return false
}

export function assignRegisteredModules(store, modules) {
  if (!store.$_registeredModules) {
    store.$_registeredModules = {} // eslint-disable-line camelcase
  }
  Object.assign(store.$_registeredModules, modules)
}

export function getRegisteredModules(store, modules) {
  if (store.$_registeredModules) {
    return store.$_registeredModules
  }
  return {}
}

export function trackModules(modules, namespace) {
  const allTrackedModules = {}
  for (const moduleName in modules) {
    const trackedModules = trackModule(
      modules[moduleName],
      moduleName,
      namespace
    )
    Object.assign(allTrackedModules, trackedModules)
  }
  return allTrackedModules
}
