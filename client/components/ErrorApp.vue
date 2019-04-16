<template>
  <div id="app">
    <template v-if="$root.errorType === 'notFound'">
      Not Found
    </template>
    <template v-else>
      Error
    </template>
  </div>
</template>
