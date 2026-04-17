import axios from 'axios';
import API_URL from '../../config';

const adminApi = axios.create({
  baseURL: `${API_URL}/admin`,
  withCredentials: true,
});

export default adminApi;
