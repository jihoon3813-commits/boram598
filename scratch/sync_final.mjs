import { spawnSync } from "child_process";
import fs from "fs";

const products = JSON.parse(fs.readFileSync("all_products.json", "utf8"));
const groupId = "jh7757mvgp49b99zhqr2gk5dt585jas7";
const PROD_URL = "https://glorious-kiwi-580.convex.cloud";

const chunkSize = 10;
for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    const data = JSON.stringify({
        groupId,
        products: chunk.map((p, idx) => ({ ...p, order: i + idx }))
    });
    
    console.log(`Pushing chunk ${i / chunkSize + 1}...`);
    // spawnSync handles arguments without shell interpolation if we pass them as an array
    const result = spawnSync("npx", ["convex", "run", "--url", PROD_URL, "products:addProducts", data], {
        shell: true, // required for npx on windows
        encoding: "utf8"
    });
    
    if (result.status !== 0) {
        console.error(`Error in chunk ${i / chunkSize + 1}:`, result.stderr);
        // If it still fails due to quoting, try with escaped data
    } else {
        console.log(`Chunk ${i / chunkSize + 1} pushed.`);
    }
}
