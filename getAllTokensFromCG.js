import https from 'https'; // or 'https' for https:// URLs
import fs from 'fs';

const file = fs.createWriteStream("allTokensFromCG.json");
const request = https.get("https://api.coingecko.com/api/v3/coins/list?include_platform=true", function(response) {
  response.pipe(file);
});