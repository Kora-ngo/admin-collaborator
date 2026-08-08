import axios from "axios";

// API key at https://countrystatecity.in: set as
// VITE_CSC_API_KEY in your .env file.
const locationApiInstance = axios.create({
    baseURL: "https://api.countrystatecity.in/v1",
    headers: {
        "X-CSCAPI-KEY": import.meta.env.VITE_CSC_API_KEY,
    },
});

export default locationApiInstance;