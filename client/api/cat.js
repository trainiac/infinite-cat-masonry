import axios from 'axios'
const AppApi = axios.create({
  timeout: 30000,
  baseURL: 'https://api.thecatapi.com/',
  headers: {
    'x-api-key': 'a0cc2246-0b56-44a5-ba1f-8cb2e7ad08e1',
  },
})
export default AppApi
