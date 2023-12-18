import Axios from 'axios';

const axios = Axios.create({
	baseURL: import.meta.env.MODE == 'development' ? "http://192.168.0.116:8000/api/" : "http://192.168.0.103:7777/loomie.ru/api/",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
		"Accept": "application/json",
	},
});

export default axios;