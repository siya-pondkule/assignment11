const express = require('express');
const neo4j = require('neo4j-driver');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Fixed: Use IPv4 instead of localhost (::1 causes issues on some setups)
const driver = neo4j.driver(
  "bolt://127.0.0.1:7687",
  neo4j.auth.basic('neo4j', 'neo4j123') // replace with your actual password
);

const session = driver.session();

app.post('/query', async (req, res) => {
  const { paperA, paperB, queryType, customQuery } = req.body;
  let cypher = '';
  let params = {};

  // Log incoming request for debugging
  console.log('Received query:', req.body);

  try {
    if (queryType === 'citation') {
      cypher = `
        MATCH path = (a:Paper {id: $paperA})-[:CITES*1..5]->(b:Paper {id: $paperB})
        RETURN path LIMIT 1
      `;
      params = { paperA, paperB };
    } else if (queryType === 'classification') {
      cypher = `
        MATCH (p:Paper {id: $paperA})-[:HAS_CLASSIFICATION]->(c:Classification)-[:SUBCLASS_OF*0..]->(parent)
        RETURN p.id, p.class, c.name AS classification, collect(parent.name) AS fullHierarchy
      `;
      params = { paperA };
    } else if (queryType === 'custom') {
      cypher = customQuery;
    }

    console.log('Running Cypher query:', cypher, 'with params:', params);

    const result = await session.run(cypher, params);

    // Log result for debugging
    console.log('Cypher query result:', result.records);

    res.json(result.records.map(record => record.toObject()));
  } catch (err) {
    // Log full error details for debugging
    console.error('Error executing Cypher query:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.stack });
  }
});

app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
