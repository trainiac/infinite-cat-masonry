const axios = require('axios')
const AppApi = axios.create({
  timeout: 30000,
})

export default AppApi
