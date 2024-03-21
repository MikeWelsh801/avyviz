import { LatLng } from "react-native-maps";
import { filePaths, readAllFiles, readFromFileSystem } from "./fileSystemHelpers";
import { EncodingType } from "expo-file-system";
import { DangerInfo, distance } from "./types";
import { dangerTable } from "../../assets/dangerInfo";

import { Position } from "geojson";


type TrailAveStats = {
  elevationGain: number;
  elevationLoss: number;
  aveAspect: number;
  aveSlope: number;
};

type MountainStats = {
  aspect: number;
  slope: number;
  elevation: number;
};

type UAC_Region = {
  name: string;
  top_left: {
    longitude: number;
    latitude: number;
  };
  bottom_right: {
    longitude: number;
    latitude: number;
  };
};

// defines elevation offset into danger array
const ElevationBounds = {
  low: 2438.4,
  high: 2895.6,
};

// defines aspect offset into danger array
const AspectBounds = [
  { min: 337.5, max: 22.5 }, // this will never be true, but required for spacing
  { min: 22.5, max: 67.5 },
  { min: 67.5, max: 112.5 },
  { min: 112.5, max: 157.5 },
  { min: 157.5, max: 202.5 },
  { min: 202.5, max: 247.5 },
  { min: 247.5, max: 292.5 },
  { min: 292.5, max: 337.5 },
];

/** Hard-coded Bounding boxes based on tiff bboxes for now, but we can add a more
 * sophisticated algorithm later. */
const RegionBounds: UAC_Region[] = [
  // give salt lake the most precedence for now in case regions overlap
  {
    name: "salt-lake",
    top_left: { longitude: -111.90693699353761, latitude: 40.95352169527723 },
    bottom_right: { longitude: -111.4784406030126, latitude: 40.5098437764506 },
  },
  {
    name: "abajos",
    top_left: { longitude: -109.84413560661396, latitude: 37.95997584247734 },
    bottom_right: { longitude: -109.42102910779367, latitude: 37.68050995758776 },
  },
  {
    name: "logan",
    top_left: { longitude: -112.08902550162864, latitude: 42.33162717264499 },
    bottom_right: { longitude: -111.38851924307224, latitude: 41.49727193675478 },
  },
  {
    name: "moab",
    top_left: { longitude: -109.41563921608895, latitude: 38.694168924188226 },
    bottom_right: { longitude: -109.05846905912303, latitude: 38.33942421848943 },
  },
  {
    name: "ogden",
    top_left: { longitude: -112.02317899130267, latitude: 41.47517338076544 },
    bottom_right: { longitude: -111.34189667982643, latitude: 40.97831519711893 },
  },
  {
    name: "provo",
    top_left: { longitude: -111.82860390076239, latitude: 40.55889179096353 },
    bottom_right: { longitude: -111.37944625870263, latitude: 40.02933493097507 },
  },
  {
    name: "skyline",
    top_left: { longitude: -111.75377423759524, latitude: 39.898630057135684 },
    bottom_right: { longitude: -110.99020624609365, latitude: 38.78229365356035 },
  },
  {
    name: "uintas",
    top_left: { longitude: -111.32393037414404, latitude: 41.009486737477886 },
    bottom_right: { longitude: -110.73885762959699, latitude: 40.18914522001994 },
  },
];

/**
 * @param meters - Meters (probably elevation)
 * @returns Feet
 */
function metersToFeet(meters: number) {
  return Math.round(meters * 3.28084);
}

/**
 * @param aspect - the average aspect in degrees (0 - 360)
 * @returns - a formatted string with the Conpass aspect (e.g. South West)
 */
function convertAspect(aspect: number): string[] {
  if (22.5 <= aspect && aspect < 67.5) {
    return ["North East", "NE"];
  } else if (67.5 <= aspect && aspect < 112.5) {
    return ["East", "E"];
  } else if (112.5 <= aspect && aspect < 157.5) {
    return ["South East", "SE"];
  } else if (157.5 <= aspect && aspect < 202.5) {
    return ["South", "S"];
  } else if (202.5 <= aspect && aspect < 247.5) {
    return ["South West", "SW"];
  } else if (247.5 <= aspect && aspect < 292.5) {
    return ["West", "W"];
  } else if (292.5 <= aspect && aspect < 337.5) {
    return ["North West", "NW"];
  } else {
    return ["North", "N"];
  }
}

/**
 * @param long1 - Starting longitude
 * @param long2 - Ending longitude
 * @param lat1 - Starting latitude
 * @param lat2 - Ending latitude
 * @param long_target - a longitude value BETWEEN long1 and long2
 *
 * @returns a the latitude along the linear interpolation between the two points
 */
function lerp(
  long1: number,
  long2: number,
  lat1: number,
  lat2: number,
  long_target: number
): number {
  let slope = (lat2 - lat1) / (long2 - long1);
  if (Number.isNaN(slope)) {
    console.log("found nan")
    return lat1 + long_target;
  }
  return slope * (long_target - long1) + lat1;
}

/**
 * @param long1 - Starting longitude
 * @param long2 - Ending longitude
 * @param lat1 - Starting latitude
 * @param lat2 - Ending latitude
 * @param delta - a 0 - 1 number representing the proportion of the distance between p1
 * and p2
 *
 * @returns a the latitude along the linear interpolation between the two points
 */
function lerpProportional(
  long1: number,
  long2: number,
  lat1: number,
  lat2: number,
  delta: number
): Position {
  let x = (1 - delta) * long1 + delta * long2;
  let y = (1 - delta) * lat1 + delta * lat2;
  return [x, y]
}
/**
 * @param trailPoints - a list of trail points
 *
 * @returns given the points along a trail, this function creates
 * a list mapping danger scores to coordinates along the route
 */
async function getAllDangers(trailPoints: Position[]):
  Promise<{ danger: number, coordinate: Position }[]> {
  let dangerMap = [];

  for (let i = 0; i < trailPoints.length - 1; i++) {
    let p1 = trailPoints[i];
    let p2 = trailPoints[i + 1];

    let targetX = p1[0];
    let lastDanger = -20; // some dummy number
    let lastPoint = p1;
    if (p1[0] < p2[0]) {
      // walk up to p2
      while (targetX <= p2[0]) {
        let targetY = slerp(p1, p2, targetX);
        let danger = await getDangerRating({ longitude: targetX, latitude: targetY });

        // only push points that have danger changes
        if (danger != lastDanger) {
          const edge = await findEdge(lastPoint, [targetX, targetY], lastDanger, danger);
          dangerMap.push({ danger: danger, coordinate: edge });
          lastDanger = danger;
          lastPoint = [targetX, targetY];
        }

        targetX += 0.001;
      }
    } else {
      // walk down to p2
      while (targetX >= p2[0]) {
        let targetY = slerp(p1, p2, targetX);
        let danger = await getDangerRating({ longitude: targetX, latitude: targetY });

        if (danger != lastDanger) {
          const edge = await findEdge(lastPoint, [targetX, targetY], lastDanger, danger);
          dangerMap.push({ danger: danger, coordinate: edge });
          lastDanger = danger;
          lastPoint = [targetX, targetY];
        }
        targetX -= 0.001;
      }
    }
    // take care of the last point
    if (i == trailPoints.length - 2) {
      let targetX = p2[0];
      let targetY = slerp(p1, p2, targetX);
      let danger = await getDangerRating({ longitude: targetX, latitude: targetY });
      // if the last point changed put in one more
      if (danger != lastDanger) {
          const edge = await findEdge(lastPoint, [targetX, targetY], lastDanger, danger);
          dangerMap.push({ danger: danger, coordinate: edge });
      }
      dangerMap.push({ danger: danger, coordinate: [targetX, targetY] });
    }
  }
  return dangerMap;

}

async function findEdge(left: Position, right: Position, leftDanger: number, rightDanger: number): Promise<Position> {
  const delta = 1e-8;
  if (Math.abs(right[0] - left[0]) < delta) {
    return left;
  }
  const midX = (right[0] + left[0]) / 2;
  const midY = slerp(left, right, midX);
  const danger = await getDangerRating({longitude: midX, latitude: midY});

  // danger changes on left
  if (danger == rightDanger) {
    return await findEdge(left, [midX, midY], leftDanger, rightDanger);
    // danger is on the right
  } else if (danger == leftDanger) {
    return await findEdge([midX, midY], right, leftDanger, rightDanger);
  } else {
    return left;
  }


  

}

function slerp(p1: Position, p2: Position, targetX: number): number {
  // calculate t (0 to 1) proportion of the distance from p1 to p2
  const t = Math.abs(targetX - p1[0]) / Math.abs(p2[0] - p1[0]);

  // convert latitude/longitude to radians
  const long1 = deg2rad(p1[0]);
  const lat1 = deg2rad(p1[1]);
  const long2 = deg2rad(p2[0]);
  const lat2 = deg2rad(p2[1]);

  // convert to two unit vectors
  const x1 = Math.cos(long1) * Math.cos(lat1); 
  const y1 = Math.sin(long1) * Math.cos(lat1);
  const z1 = Math.sin(lat1);

  const x2 = Math.cos(long2) * Math.cos(lat2);
  const y2 = Math.sin(long2) * Math.cos(lat2);
  const z2 = Math.sin(lat2);

  // calculate angle between p1 and p2 vectors inv_cos(p1 dot p2)
  let theta = Math.acos(x1 * x2 + y1 * y2 + z1 * z2);

  // slerp formula and extract latitude converting back to degrees
  const z3 = (z1 * Math.sin((1 - t) * theta) + z2 * Math.sin(t * theta)) / Math.sin(theta);
  const lat = rad2deg(Math.asin(z3));
  return lat;
}

function rad2deg(rad: number) {
  return rad * 180 / Math.PI;
}

function deg2rad(deg: number) {
  return deg * Math.PI / 180;
}

/**
 * @returns the total distance of a trail in km
 */
function trailDistance(trailMarkers: LatLng[]): distance {
  let total: number = 0;

  for (let index = 0; index < trailMarkers.length - 1; index++) {
    /* markers containing trail segment */
    const m1 = trailMarkers[index];
    const m2 = trailMarkers[index + 1];

    const rad = 6371; // radius of earth in km
    const halfPi = 0.017453292519943295; // pi/180 unit circle things

    // some wild math that I don't understand
    let a = 0.5 - Math.cos((m2.latitude - m1.latitude) * halfPi) / 2 + (Math.cos(m1.latitude * halfPi) * Math.cos(m2.latitude * halfPi) * (1 - Math.cos((m2.longitude - m1.longitude) * halfPi))) / 2;

    // kilometers between the markers
    let distance = 2 * rad * Math.asin(Math.sqrt(a));
    total += distance;
  }
  // never give in to communism
  return { km: total, miles: total * 0.621371 };
}

/**
 * @param trailMarkers - A list of trail points Position
 * @returns the maximum danger along the route
 */
async function getMaxDanger(trailMarkers: Position[]): Promise<number> {
  let mappings = await getAllDangers(trailMarkers);
  return Math.max(...mappings.map((val) => val.danger));
}

/**
 * @param trailMarkers - A list of trail points
 * @returns calculates and returns the total elevation gain, total elevation loss,
 * average slope, and average aspect.
 */
async function getTrailStats(trailMarkers: LatLng[]): Promise<TrailAveStats> {
  let totalGain: number = 0;
  let totalLoss: number = 0;
  let aveSlope: number = 0;
  let aveAspect: number = 0;

  for (let index = 0; index < trailMarkers.length - 1; index++) {
    /* markers containing trail segment */
    const st1 = await getMapData(trailMarkers[index]);
    const st2 = await getMapData(trailMarkers[index + 1]);
    if (st1 === undefined || st2 === undefined) {
      // can't determine stats set everything to zero
      return { elevationGain: 0, elevationLoss: 0, aveSlope: 0, aveAspect: 0 };
    }

    // going up
    if (st1.elevation < st2.elevation) {
      totalGain += st2.elevation - st1.elevation;
    } else {
      totalLoss += st1.elevation - st2.elevation;
    }
    aveSlope += st1.slope;
    aveAspect += st1.aspect;
    if (index == trailMarkers.length - 1) {
      aveSlope += st2.slope;
      aveAspect += st2.aspect;
    }
  }

  return {
    elevationGain: totalGain,
    elevationLoss: totalLoss,
    aveAspect: aveAspect / trailMarkers.length,
    aveSlope: aveSlope / trailMarkers.length,
  };
}

/**
 * @param gpx - The contents of a trail gpx file as a string
 * @returns an array of coordinates
 */
function getMarkersFromGpx(gpx: string): LatLng[] {
  // parse the gpx file
  return gpx
    .split("\n")
    .filter((line) => line.includes("trkpt"))
    .map((line) => {
      let lat = line.split('lat="')[1].split('"')[0];
      let long = line.split('lon="')[1].split('"')[0];

      return { latitude: +lat, longitude: +long };
    });
}

/**
 * @param location - a gps location
 * @returns the name of the UAC region that the coordinate falls in, or
 * undefined if the coordinate is not in one of UAC's regions.
 */
function getRegionName(location: LatLng): string | undefined {
  let region = RegionBounds.find((region) => {
    let inLongRange = location.longitude >= region.top_left.longitude && location.longitude <= region.bottom_right.longitude;

    let inLatRange = location.latitude >= region.bottom_right.latitude && location.latitude <= region.top_left.latitude;

    return inLongRange && inLatRange;
  });

  return region?.name;
}
type MapTile = {
  [key in string]: any | undefined;
};

/** This allows caching of map tiles for regions. */
let tiles: MapTile = {};

/**
 * @param path - Loads the tile of the given filepath
 * @returns the json tile data
 */
async function loadTile(path: string): Promise<any> {
  // read in the tile or pull from cache
  if (tiles[path] === undefined) {
    let header = await readFromFileSystem(filePaths.Overlays, path, EncodingType.UTF8);
    // extract Tie point and pixel scale from header
    tiles[path] = JSON.parse(header);
  }
  return tiles[path];
}

/**
 * @param region - map region where gps is located
 * @param location - latitude and longitude
 * @returns slope, elevation, aspect in MountainStats type
 */
async function getMapData(location: LatLng): Promise<MountainStats | undefined> {
  // console.log(region);
  let region = getRegionName(location);
  let path = `${filePaths.Overlays}${region}`;
  let files = await readAllFiles(path);
  if (files.length == 0) return undefined;

  // read in the header
  let headerJson = await loadTile(`${region}/${region}_header.json`);

  let modelTiePoint: string = headerJson["modelTiepoint"];
  let modelPixelScale: string = headerJson["modelPixelScale"];

  // get values out of scale and tie points
  let [sx, sy, _sz] = modelPixelScale.split(",").map((ele) => +ele);
  let [_px, _py, _k, gx, gy, _gz] = modelTiePoint.split(",").map((ele) => +ele);
  sy = -sy; // WGS-84 tiles have a "flipped" y component

  // gps to pixel index transform matrix
  const pixelToGPS = [gx, sx, 0, gy, 0, sy];
  const gpsToPixel = [-gx / sx, 1 / sx, 0, -gy / sy, 0, 1 / sy];

  // get the indices for the json files
  const [x, y] = transform(location.longitude, location.latitude, gpsToPixel, true);
  // console.log(`Index of ${location.longitude}, ${location.latitude}: (${x}, ${y})`);

  const gpsBBox = [transform(x, y, pixelToGPS), transform(x + 1, y + 1, pixelToGPS)];
  // console.log(`Pixel covers the following GPS area:`, gpsBBox);

  // find the correct file (x and y are in the range)
  let tileName = files.find((file) => {
    let tileIndices = getIndices(file);
    if (tileIndices == undefined) {
      return false;
    }

    let inXRange = x >= tileIndices.x1 && x <= tileIndices.x2;
    let inYRange = y >= tileIndices.y1 && y <= tileIndices.y2;
    return inXRange && inYRange;
  });

  if (tileName == undefined) {
    return undefined;
  }

  // read in the tile
  let tileJson = await loadTile(`${region}/${tileName}`);
  let tilesize = Math.sqrt(tileJson["aspect"].length);
  let tileIndices = getIndices(tileName);

  if (tileIndices == undefined) {
    return undefined;
  }
  // the array index is down
  let index = (y - tileIndices.y1) * tilesize + (x - tileIndices.x1);

  return {
    aspect: tileJson["aspect"][index],
    slope: tileJson["slope"][index],
    elevation: tileJson["elevation"][index],
  };
}

/*
 * This function gets the bounding indices out of a map tile name. May return undefined
 * numbers if the the input is the header file (no coordinates)
 */
function getIndices(tileName: string): { x1: number; y1: number; x2: number; y2: number } | undefined {
  // split the file name to extract numbers
  let split = tileName.split(/\(|\)|,/);
  let [x1, y1, x2, y2] = [split[1], split[2], split[4], split[5]];
  // case where the file is the header
  if (x1 == undefined) {
    return undefined;
  }

  return { x1: +x1, y1: +y1, x2: +x2, y2: +y2 };
}

/**
 * @param a - x coordinate or longitude
 * @param b - y coordinate or latitude
 * @param M - transform matrix
 * @param roundToInt - should this round?
 * @returns x, y indices or longitude, latitude
 */
function transform(a: number, b: number, M: number[], roundToInt = false) {
  const round = (v: number) => (roundToInt ? v | 0 : v);
  return [round(M[0] + M[1] * a + M[2] * b), round(M[3] + M[4] * a + M[5] * b)];
}

/**
 * @param coordinates - The coordinates where you would like to know avalanche danger
 * @returns the danger score according to the region's danger rose for a specific elevation
 * and aspect. The score will be 0 - 14 or -1 if there is no valid danger at that location.
 */
async function getDangerRating(coordinates: LatLng): Promise<number> {
  let region = getRegionName(coordinates);
  if (region == undefined) {
    return -1;
  }

  let dangerRose = await loadDanger(`${region}.json`);

  let mapData = await getMapData(coordinates);
  // this shouldn't only happen if the map isn't dowloaded
  if (mapData === undefined) {
    console.log("Undefined data within a region: Check if the map has been downloaded.");
    return -1;
  }

  let aspectOffset = AspectBounds.findIndex((direction) => mapData!.aspect >= direction.min && mapData!.aspect < direction.max);
  // handle North (cannot find because min > max)
  if (aspectOffset == -1) {
    aspectOffset = 0;
  }

  // high elevation if this doesn't get reset
  let elevation_offset = 0;

  // mid moutain
  if (mapData!.elevation >= ElevationBounds.low && mapData!.elevation <= ElevationBounds.high) {
    elevation_offset = 8;
  } else if (mapData!.elevation < ElevationBounds.low) {
    // low elevation
    elevation_offset = 16;
  }

  let index = elevation_offset + aspectOffset;
  return dangerRose[index];
}

type Danger = {
  [key in string]: number[] | undefined;
};

/** This allows caching of danger roses for regions. */
let dangers: Danger = {};

/**
 * @param region - A region defined in UAC's maps
 * @returns the danger rose for the given region
 */
async function loadDanger(region: string): Promise<number[]> {
  if (dangers[region] === undefined) {
    let forecast = await readFromFileSystem(filePaths.UACForecast, region, EncodingType.UTF8);
    let forecastJson = JSON.parse(forecast!);

    dangers[region] = forecastJson.overall_danger_rose.split(",").map((danger: string) => +danger);
  }

  return dangers[region]!;
}

/**
 * @param danger - (0 - 10) danger rating from danger rose array.
 * @returns "Full danger info with advisory strings and color."
 */
function getDangerInfo(danger: number): DangerInfo {
  switch (danger) {
    case 1:
      return dangerTable.lowDangerPockets;
    case 2:
      return dangerTable.lowDanger;
    case 3:
      return dangerTable.moderateDangerPockets;
    case 4:
      return dangerTable.moderateDanger;
    case 5:
      return dangerTable.considerableDangerPockets;
    case 6:
      return dangerTable.considerableDanger;
    case 7:
      return dangerTable.highDangerPockets;
    case 8:
      return dangerTable.highDanger;
    case 9:
      return dangerTable.extremeDangerPockets;
    case 10:
      return dangerTable.extremeDanger;
    default:
      return dangerTable.noRating;
  }
}


/**
 * THIS will get the current slope aspect and elevation data to use when in a region with no data.
 */
async function apiForMapData() {
  //TODO: implement this
}
export {
  trailDistance, TrailAveStats, getMarkersFromGpx, getMapData,
  getRegionName, getDangerRating, getTrailStats, RegionBounds, getMaxDanger,
  getDangerInfo, convertAspect, metersToFeet, getAllDangers
};
