import axios from "axios";

const CLIENT_ID = import.meta.env.REACT_APP_ZOHO_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.REACT_APP_ZOHO_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.REACT_APP_ZOHO_REDIRECT_URI;
const TOKEN_URL = "https://accounts.zoho.com/oauth/v2/token";

// Function to Get Authorization Code from URL
const getAuthorizationCode = async () => {
  const urlParams = new URLSearchParams(
    "https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=1000.5H3YP2H1LDNNG4REFSODOLS0BZ7EKW&state=testing&response_type=code&redirect_uri=http://localhost:5173&access_type=offline"
  );
  return urlParams.get("code");
};

// Function to Exchange Authorization Code for Access Token
export const getAccessToken = async () => {
  alert("");
  try {
    const code = await getAuthorizationCode();
    const response = await axios.post(TOKEN_URL, null, {
      params: {
        code: code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,

        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      },
    });
    console.log("response", response);
    if (response.data.access_token) {
      localStorage.setItem("zoho_access_token", response.data.access_token);
      localStorage.setItem("zoho_refresh_token", response.data.refresh_token);
      console.log("✅ Zoho Access Token Obtained");
      return response.data.access_token;
    }
  } catch (error) {
    console.error("❌ Error getting access token:", error);
  }
  return null;
};

// Function to Refresh Expired Token
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("zoho_refresh_token");
    if (!refreshToken) {
      console.error("❌ No refresh token found, re-authentication needed.");
      return null;
    }

    const response = await axios.post(TOKEN_URL, null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      },
    });

    if (response.data.access_token) {
      localStorage.setItem("zoho_access_token", response.data.access_token);
      console.log("🔄 Access token refreshed successfully");
      return response.data.access_token;
    }
  } catch (error) {
    console.error("❌ Error refreshing access token:", error);
  }
  return null;
};
