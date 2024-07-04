
import requests

useragent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
headers = {
    'Connection': 'keep-alive',
    'sec-ch-ua': '"Google Chrome 80"',
    'Accept': '*/*',
    'Sec-Fetch-Dest': 'empty',
    'User-Agent': useragent,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': 'https://overpass-turbo.eu',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-Mode': 'cors',
    'Referer': 'https://overpass-turbo.eu/',
    'Accept-Language': '',
    'dnt': '1',
}

query = """
[out:xml][timeout:25];

// gather results
(
  way["healthcare"="hospital"](14.544701,120.94261,14.639891,121.02607);
  way["amenity"="hospital"](14.544701,120.94261,14.639891,121.02607);
  way["amenity"="police"](14.544701,120.94261,14.639891,121.02607);
  way["amenity"="fire_station"](14.544701,120.94261,14.639891,121.02607);
  way["emergency"="yes"](14.544701,120.94261,14.639891,121.02607);
  way["highway"](14.544701,120.94261,14.639891,121.02607);
  
  relation["amenity"="hospital"](14.544701,120.94261,14.639891,121.02607);
  relation["healthcare"="hospital"](14.544701,120.94261,14.639891,121.02607);
  relation["amenity"="police"](14.544701,120.94261,14.639891,121.02607);
  
);

out body;
>;
out skel qt;

"""

SAVED_FILE = '<file_path>'
QUERY_FILE = 'query5.osm'

data = {
  'data': query
}

print(f"--- query -----\n{query}\n--- end query ---\n")

print('testing the file path...')



with open(SAVED_FILE + 'test.txt', 'w') as f:
    f.write('test')

print('attempting to fetch data from overpass-api.de')
response = requests.post('https://overpass-api.de/api/interpreter', headers=headers, data=data)

print(f'writing to {SAVED_FILE}')
with open(SAVED_FILE + QUERY_FILE, 'w') as f:
    f.write(response.text)
