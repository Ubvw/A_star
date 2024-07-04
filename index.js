const xml2js = require('xml2js');
const fs = require('fs');
const osmParser = require('./osm-parser');
const parser = new xml2js.Parser();

fs.readFile("query5.osm", (err, data) => {
    parser.parseString(data, (err, result) => {
        osmParser.parseNodes(result.osm);     
        const addresses = osmParser.parseAddresses(result.osm);
        osmParser.createGraph(result.osm);
        const nodes = osmParser.getNodes();
        const data = {
            addresses: addresses,
            nodes: nodes
        }

        fs.writeFileSync("./html/mnl.json", JSON.stringify(data));
    });
});