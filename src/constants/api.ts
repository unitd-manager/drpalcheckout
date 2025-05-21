import axios from "axios";

const api = axios.create({
  baseURL: "https://drpalsnewme.com/subscription-api",
});

export default api; 
