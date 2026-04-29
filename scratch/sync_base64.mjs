import { spawnSync } from "child_process";
import fs from "fs";

const products = JSON.parse(fs.readFileSync("all_products.json", "utf8"));
const groupId = "jh7757mvgp49b99zhqr2gk5dt585jas7";
const PROD_URL = "https://glorious-kiwi-580.convex.cloud";

const chunkSize = 15;
for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    const chunkWithOrder = chunk.map((p, idx) => ({ ...p, order: i + idx }));
    const base64Data = Buffer.from(JSON.stringify(chunkWithOrder)).toString('base64');
    
    const argsJson = JSON.stringify({
        groupId,
        base64Data
    });
    
    console.log(`Pushing chunk ${Math.floor(i / chunkSize) + 1}...`);
    const result = spawnSync("npx", ["convex", "run", "--url", PROD_URL, "products:addProductsBase64", argsJson], {
        shell: true,
        encoding: "utf8"
    });
    
    if (result.status !== 0) {
        console.error(`Error in chunk ${Math.floor(i / chunkSize) + 1}:`, result.stderr);
    } else {
        console.log(`Chunk ${Math.floor(i / chunkSize) + 1} pushed.`);
    }
}
console.log("All chunks processed!");
