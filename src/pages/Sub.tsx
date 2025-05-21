// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import getZohoAuthURL from "../constants/getZohoAuthURL";
// const API_BASE_URL = "http://localhost:3000/api";

// const Subscription = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const authCode = urlParams.get("code");

//     if (authCode) {
//       console.log("✅ Authorization Code:", authCode);
//       getAccessToken(authCode);
//     }
//   }, []);

//   const getAccessToken = async (authCode: any) => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/getAccessToken`, {
//         code: authCode,
//       });

//       localStorage.setItem("zoho_access_token", response.data.accessToken);
//       localStorage.setItem("zoho_refresh_token", response.data.refreshToken);

//       // navigate("/login");
//     } catch (error) {
//       console.error("❌ Error getting access token:", error);
//     }
//   };

//   return (
//     <div>
//       <h1>Zoho Books OAuth</h1>
//       <a href={getZohoAuthURL()}>Login with Zoho</a>
//     </div>
//   );
// };

// export default Subscription;
