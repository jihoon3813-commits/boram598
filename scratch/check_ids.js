const axios = require('axios');
async function run() {
  const r = await axios.get('https://xn--299ar6vqrd.com/model/view.php?idx=429', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const re = /id=["']([^"']+)["']/gi;
  let m;
  while (m = re.exec(r.data)) {
    if (m[1].toLowerCase().includes('detail')) console.log('ID match:', m[1]);
  }
}
run();
