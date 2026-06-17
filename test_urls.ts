import https from "https";

https.get("https://unpkg.com/d3-geomap@3.4.0/topojson/countries/IND.json", res => {
  console.log(res.statusCode);
});
