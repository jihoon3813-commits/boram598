const axios = require('axios');
const { URL } = require('url');

async function test() {
  const url = 'https://xn--299ar6vqrd.com/model/list.php?ca_id=035&filter_seller%5B%5D=AP-100054&filter_account%5B%5D=1';
  const urlObj = new URL(url);
  
  const ca_id = urlObj.searchParams.get("ca_id") || "035";
  const seller = urlObj.searchParams.get("filter_seller[]") || urlObj.searchParams.get("filter_seller%5B%5D") || "AP-100054";
  const account = urlObj.searchParams.get("filter_account[]") || urlObj.searchParams.get("filter_account%5B%5D") || "1";
  
  const targetDomain = "https://xn--299ar6vqrd.com";
  const apiUrl = `${targetDomain}/api/v2/models?ca_id=${ca_id}&filter_seller%5B%5D=${seller}&filter_account%5B%5D=${account}&section=models`;
  
  console.log('Testing URL:', apiUrl);
  
  try {
    const resp = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "X-Requested-With": "XMLHttpRequest"
      }
    });
    console.log('Success! Count:', resp.data.Lists ? resp.data.Lists.length : 'No Lists');
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
