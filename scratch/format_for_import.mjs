import fs from "fs";

const products = JSON.parse(fs.readFileSync("all_products.json", "utf8"));
const groupId = "jd7f771m3en4trpt17d8evgq9185qn4h";

const formatted = products.map((p, idx) => ({
    ...p,
    groupId,
    order: idx
}));

fs.writeFileSync("all_products_formatted.json", JSON.stringify(formatted, null, 2));
console.log(`Saved ${formatted.length} formatted products for import.`);
