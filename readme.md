## resqme

### osm_downloader

OSM file downloader, you can change query depends on the size of bbox set through coordinates

### osm-parser

Library for parsing the OSM file into json which is default save as `mnl.json`,
`mnl.json` has two array json:

 `addresses` and `nodes`


 #### How to run?
 ```
 # install first the dependencies
 npm i or npm install

 # run the osm-parser, default saved inside the html
node index.js

```

 ### html

 inside the html file has `index.html` core file  where the a-star function is also served via `<script>...</script>`

 #### functions used

`function nearestNeighbour(lat, lon)` 

`function nearestEmergencyService(lat, lon)` - used to find the nearest service for approx 30km by default

`function getNearestValidNode(lat, lon)`

`function astar(startId, goalId)`

`function constructPath(node)` - path for displaying in the maps

`function getChildren(parent, goalId, data) `

`function distance(lat1, lon1, lat2, lon2)` - manhattan distance as heuristic formula




