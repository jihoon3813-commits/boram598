import axios from "axios";

async function test(themesNo) {
  const url = `https://boram.lifenuri.com/shop/themes/${themesNo}/list`;
  const params = new URLSearchParams();
  params.append('actions', 'goods');
  params.append('themes_no', themesNo.toString());

  console.log(`Testing ${url}...`);
  try {
    const resp = await axios.post(url, params.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://boram.lifenuri.com/shop/themesgroup/140"
      },
      timeout: 10000
    });
    console.log(`Success ${themesNo}:`, JSON.stringify(resp.data));
    if (resp.data.themeslistrow) {
        console.log(`Count: ${resp.data.themeslistrow.length}`);
    }
  } catch (e) {
    console.error(`Error ${themesNo}:`, e.message);
  }
}

async function run() {
  await test(139);
  await test(140);
  await test(141);
}

run();
