let nodes = {};

function parseNodes(osm) {
    nodes = {};

    if (osm.node) {
        for (let n of osm.node) {
            let attr = n["$"];
            nodes[attr["id"]] = {
                lat: parseFloat(attr["lat"]),
                lon: parseFloat(attr["lon"]),
                con: new Set()
            };
        }
    }

    return nodes;
}

function getAvgLatLon(nds) {
    let lat = 0;
    let lon = 0;
    let count = 0;

    for (let node of nds) {
        let ref = node["$"]["ref"];
        if (nodes[ref]) {
            lat += nodes[ref]["lat"];
            lon += nodes[ref]["lon"];
            count++;
        }
    }

    return {
        lat: (count > 0 ? lat / count : 0),
        lon: (count > 0 ? lon / count : 0)
    };
}

function getWayNodes(osm, wayRefs) {
    let wayNodes = [];

    for (let ref of wayRefs) {
        let way = osm.way.find(w => w["$"]["id"] === ref);
        if (way && way.nd) {
            wayNodes.push(...way.nd);
        }
    }

    return wayNodes;
}

function processElement(osm, element) {
    let address = {};
    let tagValue = null;
    let nameValue = null;

    if (element.tag) {
        for (let attr of element.tag) {
            attr = attr["$"];

            if (!tagValue && (attr["k"] === "amenity" || attr["k"] === "healthcare" || attr["k"] === "building" )) {
                
                tagValue = `${attr["k"]}:${attr["v"]}`;
            }

            if (attr["k"] === "name") {
                nameValue = attr["v"];
            }

            if (attr["k"].startsWith("addr:")) {
                address[attr["k"]] = attr["v"];
            }
        }
    }

    if (element.nd) {
        let ll = getAvgLatLon(element.nd);
        address["lat"] = ll.lat;
        address["lon"] = ll.lon;
    }

    if (element.member) {
        let wayRefs = element.member.filter(m => m["$"]["type"] === "way").map(m => m["$"]["ref"]);
        let wayNodes = getWayNodes(osm, wayRefs);
        let ll = getAvgLatLon(wayNodes);
        address["lat"] = ll.lat;
        address["lon"] = ll.lon;
    }

    if (tagValue && tagValue.startsWith("amenity:")) {
        address["tag"] = tagValue;
    } else if (tagValue && !address["tag"]) {
        address["tag"] = tagValue;
    }

    if (nameValue) {
        address["name"] = nameValue;
    }

    if (Object.keys(address).some(key => key.startsWith("addr:"))) {
        address["address"] = Object.keys(address)
            .filter(key => key.startsWith("addr:"))
            .map(key => address[key])
            .join(", ");
        
        Object.keys(address)
            .filter(key => key.startsWith("addr:"))
            .forEach(key => delete address[key]);

        return address;
    }

    return null;
}

function parseAddresses(osm) {
    let addresses = [];

    if (osm.way) {
        for (let way of osm.way) {
            let address = processElement(osm, way);
            if (address) {
                addresses.push(address);
            }
        }
    }

    if (osm.relation) {
        for (let relation of osm.relation) {
            let address = processElement(osm, relation);
            if (address) {
                addresses.push(address);
            }
        }
    }

    return addresses;
}

function createGraph(osm) {
    if (osm.way) {
        for (let way of osm.way) {
            if (way.tag) {
                let highway = false;
                let junction = false;

                for (let attr of way.tag) {
                    attr = attr["$"];
                    if (attr["k"] == "highway") {
                        highway = true;
                    } else if (attr["k"] == "junction") {
                        junction = true;
                    }
                }

                if (junction) {
                    for (let j = 0; j < way.nd.length; j++) {
                        let curr = way.nd[j]["$"]["ref"];
                        for (let i = 0; i < way.nd.length; i++) {
                            let next = way.nd[i]["$"]["ref"];
                            if (curr != next) {
                                nodes[next].con.add(curr);
                                nodes[curr].con.add(next);
                            }
                        }
                    }
                } else if (highway) {
                    for (let i = 1; i < way.nd.length; i++) {
                        let prev = way.nd[i-1]["$"]["ref"];
                        let curr = way.nd[i]["$"]["ref"];
                        nodes[prev].con.add(curr);
                        nodes[curr].con.add(prev);
                    }
                }
            }
        }
    }
}

function getNodes() {
    let out = {};

    for (let key in nodes) {
        if (nodes[key] && nodes[key].con && nodes[key].con.size > 0) {
            let node = nodes[key];
            node.con = Array.from(node.con);
            out[key] = node;
        }
    }

    return out;
}

module.exports = {
    parseNodes: parseNodes,
    parseAddresses: parseAddresses,
    createGraph: createGraph,
    getNodes: getNodes
};
