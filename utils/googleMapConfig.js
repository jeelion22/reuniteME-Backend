import { Loader } from "@googlemaps/js-api-loader";
import { GOOGLE_MAP_API_KEY, GOOGLE_MAP_VERSION } from "./config";

const loader = new Loader({
  apiKey: GOOGLE_MAP_API_KEY,
  version: GOOGLE_MAP_VERSION,
});

module.exports = loader;
