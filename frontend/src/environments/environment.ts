const hostname = window.location.hostname;
const apiHost = hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'http://192.168.1.158:3000';

export const environment = {
  production: false,
  apiUrl: `${apiHost}/api`
};