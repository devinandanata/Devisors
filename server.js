const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();


app.use(express.json());


const db = new sqlite3.Database("./donors.db", (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});


db.run(
  `CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    location TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  (err) => {
    if (err) console.error(err.message);
    else console.log("Donors table ready.");
  }
);

app.post("/api/register", (req, res) => {
  const { name, blood_group, location, contact_number } = req.body;
  if (!name || !blood_group || !location || !contact_number) {
    return res.status(400).send("All fields are required.");
  }

  const query = `INSERT INTO donors (name, blood_group, location, contact_number) VALUES (?, ?, ?, ?)`;
  db.run(
    query,
    [name, blood_group, location, contact_number],
    function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).send("Error registering donor.");
      } else {
        res.status(201).send({ id: this.lastID });
      }
    }
  );
});

app.get("/api/find-donors", (req, res) => {
  const { blood_group, location } = req.query;

  if (!blood_group || !location) {
    return res.status(400).send("Blood group and location are required.");
  }

  const query = `SELECT * FROM donors WHERE blood_group = ? AND location = ?`;
  db.all(query, [blood_group, location], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send("Error retrieving donors.");
    } else {
      res.status(200).json(rows);
    }
  });
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
