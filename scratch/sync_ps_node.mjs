import fs from "fs";
import { execSync } from "child_process";

const products = JSON.parse(fs.readFileSync("all_products.json", "utf8"));
const groupId = "jd7f771m3en4trpt17d8evgq9185qn4h";
const PROD_URL = "https://glorious-kiwi-580.convex.cloud";

const chunkSize = 15;
for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    const chunkWithOrder = chunk.map((p, idx) => ({ ...p, order: i + idx }));
    const base64Data = Buffer.from(JSON.stringify(chunkWithOrder)).toString('base64');
    
    // In PowerShell, we can use single quotes to wrap the JSON string.
    // We only need to escape internal single quotes (which shouldn't exist in Base64).
    const argsJson = `{"groupId":"${groupId}","base64Data":"${base64Data}"}`;
    const psCommand = `npx convex run --url ${PROD_URL} products:addProductsBase64 '${argsJson}'`;
    
    console.log(`Pushing chunk ${Math.floor(i / chunkSize) + 1}...`);
    try {
        execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
        console.log(`Chunk ${Math.floor(i / chunkSize) + 1} pushed.`);
    } catch (e) {
        console.error(`Error in chunk ${Math.floor(i / chunkSize) + 1}`);
    }
}
console.log("All chunks processed!");
