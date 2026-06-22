const express = require("express");
const db = require("./db");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "CodeVector Product API",
    endpoints: {
      products: "/products?limit=10",
      products_with_cursor: "/products?limit=10&cursor=<next_cursor>",
      products_by_category: "/products?category=Electronics&limit=10",
      categories: "/categories"
    }
  });
});

app.get("/products", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const category = req.query.category;
    const cursor = req.query.cursor;

    let products;

    if (category) {
      if (cursor) {
        products = await db.query(
          `SELECT * FROM products
           WHERE category = $1 AND created_at < $2
           ORDER BY created_at DESC
           LIMIT $3`,
          [category, cursor, limit]
        );
      } else {
        products = await db.query(
          `SELECT * FROM products
           WHERE category = $1
           ORDER BY created_at DESC
           LIMIT $2`,
          [category, limit]
        );
      }
    } else {
      if (cursor) {
        products = await db.query(
          `SELECT * FROM products
           WHERE created_at < $1
           ORDER BY created_at DESC
           LIMIT $2`,
          [cursor, limit]
        );
      } else {
        products = await db.query(
          `SELECT * FROM products
           ORDER BY created_at DESC
           LIMIT $1`,
          [limit]
        );
      }
    }

    const rows = products.rows;

    const nextCursor = rows.length === limit
      ? rows[rows.length - 1].created_at
      : null;

    res.json({
      limit,
      category: category || "all",
      next_cursor: nextCursor,
      products: rows
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/categories", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT category FROM products ORDER BY category`
    );
    res.json({ categories: result.rows.map(r => r.category) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5000, "0.0.0.0", () => {
  console.log("RUNNING 5000");
});