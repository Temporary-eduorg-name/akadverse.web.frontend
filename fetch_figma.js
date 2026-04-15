const fs = require('fs');

async function fetchFigma() {
  const token = "figd_6Qt1eWp1Qa0HS1wkPFn1zegTZsOY5y75nw9WEtYr";
  const url = "https://api.figma.com/v1/files/j0dke7oAxZx6wOK9ILD3G7/nodes?ids=1279:320";

  try {
    const res = await fetch(url, { headers: { "X-Figma-Token": token }});
    const data = await res.json();
    fs.writeFileSync('figma_data_node.json', JSON.stringify(data, null, 2));
    console.log("Successfully fetched Figma data");
  } catch (err) {
    console.error("Error fetching", err);
  }
}

fetchFigma();
