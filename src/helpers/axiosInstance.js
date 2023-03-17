import axios from "axios";

// creating an instance with base url and allwing response cookies
const axiosInstance = axios.create({
  baseURL: `${"https://api.socialverseapp.com"}`,
  credentials: "include",
  withCredentials: true,
});

export default axiosInstance;
