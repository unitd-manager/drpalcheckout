import zoho from "./zoho";

const getZohoAuthURL = () => {
  const clientId = zoho.client_id;
  const redirectUri = zoho.redirect_id;
  const scope = "ZohoBooks.fullaccess.all";
  console.log(clientId);
  return `https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent`;
};

export default getZohoAuthURL;
