const db = require("./db");

async function seed() {
  const categories = ["Electronics", "Clothing", "Books", "Home", "Sports", "Beauty"];
  const batchSize = 1000;
  const totalRows = 200000;

  console.log("Seeding started...");

  // clear old data first
  await db.query("TRUNCATE TABLE products RESTART IDENTITY");

  for (let batch = 0; batch < totalRows / batchSize; batch++) {
    const values = [];

    for (let i = 0; i < batchSize; i++) {
      const rowNum = batch * batchSize + i + 1;
      const category = categories[rowNum % categories.length];
      const price = Math.floor(Math.random() * 10000) + 100;

      // each product gets a different timestamp, spread over last 2 years
      const daysAgo = Math.floor(Math.random() * 730);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

      values.push(`('Product ${rowNum}', '${category}', ${price}, '${createdAt}', '${createdAt}')`);
    }

    await db.query(`
      INSERT INTO products (name, category, price, created_at, updated_at)
      VALUES ${values.join(",")}
    `);

    console.log(`Inserted ${(batch + 1) * batchSize} / ${totalRows}`);
  }

  console.log("Done! 200,000 products inserted.");
  process.exit();
}

seed();