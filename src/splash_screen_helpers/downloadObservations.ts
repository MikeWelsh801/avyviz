import { collection, getDocs, limit, query } from "firebase/firestore";
import { getTodaysDate, standards, timeZones } from "../generic_helpers/getTodaysDate";
import { db } from "../../Firebase";
import { AvalancheCenter } from "../generic_helpers/avalancheCenterInfo";
import * as FileSystem from "expo-file-system";
import { writeToFileSystem, filePaths, deleteFileOrDirectory, readAllFiles, readFromFileSystem } from "../generic_helpers/fileSystemHelpers";
import { AveProps, ObsProps } from "../components/mapPopup";
import { getRegionName } from "../generic_helpers/trailHelpers";
import { Position } from "geojson";
import { EncodingType } from "expo-file-system";

/**
 * @param month - Returns the number of days in a month.
 */
function daysInMonth(month: number): number {
  switch (month) {
    case 1: return 31;
    case 2: return 29;
    case 3: return 31;
    case 4: return 30;
    case 5: return 31;
    case 6: return 30;
    case 7: return 31;
    case 8: return 31;
    case 9: return 30;
    case 10: return 31;
    case 11: return 30;
    case 12: return 31;
    default: return -100000; // this won't happen
  }
}

/**
 * @param today - today's date
 * @returns yesterday's date
 */
function getYesterday(today: string): string {
  let args = today.split('-');
  let month = +args[0];
  let day = +args[1];
  let year = +args[2];
  day--;

  if (day == 0) {
    month--;
    if (month == 0) {
      month = 12;
      year--;
    }
    day = daysInMonth(month);
  }

  return [month, day, year].join('-');
}

/**
 * downloads the 7 latest days worth of observation data.
 * @param avalancheCenter Avalanche center to download data for.
 */
async function downloadObservations(avalancheCenter: AvalancheCenter) {
  // load based on what regions the user has downloaded
  let regions = await readAllFiles(filePaths.Overlays);

  // I'm so sorry about this
  let currentDate = getTodaysDate(standards.US, timeZones.MST);
  let yesterday = getYesterday(currentDate);
  let twoDaysAgo = getYesterday(yesterday);
  let threeDaysAgo = getYesterday(twoDaysAgo);
  let dates = [currentDate, yesterday, twoDaysAgo, threeDaysAgo];

  // clear out the directories
  await deleteFileOrDirectory(filePaths.UACAvalanches);
  await deleteFileOrDirectory(filePaths.UACObservations);

  // let regions = getAvalancheCenterRegions(avalancheCenter);
  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    for (let j = 0; j < dates.length; j++) {
      const date = dates[j];
      // read observations from db
      let observationRef = collection(db, `UAC/observations/${region}/${date}/Observation`);
      let observationQuery = query(observationRef, limit(10));
      let obsSnapshot = await getDocs(observationQuery);
      let observations = obsSnapshot.docs.map((doc) => doc.data());
      let obsIds = obsSnapshot.docs.map((doc) => doc.id);

      // write observations to file
      for (let index = 0; index < observations.length; index++) {
        const observation = observations[index];
        const id = obsIds[index];
        await writeToFileSystem(filePaths.UACObservations, `${id}_${region}Observation${index}_${date}.json`, JSON.stringify(observation), FileSystem.EncodingType.UTF8);
      }

      // read avalanches from db
      let avalancheRef = collection(db, `UAC/observations/${region}/${date}/Avalanche`);
      let avalancheQuery = query(avalancheRef, limit(10));
      let aveSnapshot = await getDocs(avalancheQuery);
      let avalanches = aveSnapshot.docs.map((doc) => doc.data());
      let aveIds = aveSnapshot.docs.map((doc) => doc.id);
      // write avalanches to file
      for (let index = 0; index < avalanches.length; index++) {
        const avalanche = avalanches[index];
        const id = aveIds[index];
        await writeToFileSystem(filePaths.UACAvalanches, `${id}_${region}Avalanche${index}_${date}.json`, JSON.stringify(avalanche), FileSystem.EncodingType.UTF8);
      }
    }
  }
}

/**
 * @param location - Loads and stores observations for the region associated with
 * the user's location.
 */
async function getObservations(): Promise<{ observations: ObsProps[], avalanches: AveProps[] }> {
  // read in all of the observations
  let files = await readAllFiles(filePaths.UACObservations);
  let observations: ObsProps[] = [];
  for (let index = 0; index < files.length; index++) {
    let observation = files[index];
    observation = await readFromFileSystem(filePaths.UACObservations, observation, EncodingType.UTF8);
    let json = JSON.parse(observation);

    let position: Position = json["Coordinates"].split(",").map((num: string) => +num);
    if (position.length == 2)
      // all of the fields could be null so do coalescing
      observations.push({
        id: +files[index].split('_')[0],
        position: position,
        date: json["Observation Date"] ?? "",
        location: json["Location Name or Route"] ?? "",
        elevation: json["Elevation"] ?? "",
        aspect: json["Aspect"] ?? "",
        slope: json["Slope Angle"] ?? "",
        red_flags: json["Red Flags"] ?? "",
      });
  }

  // read in all of the avalanches
  let aveFiles = await readAllFiles(filePaths.UACAvalanches);
  let avalanches: AveProps[] = [];
  for (let index = 0; index < aveFiles.length; index++) {
    let avalanche = aveFiles[index];
    avalanche = await readFromFileSystem(filePaths.UACAvalanches, avalanche, EncodingType.UTF8);
    let json = JSON.parse(avalanche);

    let position = json["Coordinates"].split(",").map((num: string) => +num);
    if (position.length == 2)
      // all of the fields could be null, if the user didn't write anything
      avalanches.push({
        id: +aveFiles[index].split('_')[0],
        position: position,
        location: json["Location Name or Route"] ?? "",
        date: json["Observation Date"] ?? "",
        depth: json["Depth"] ?? "",
        vertical: json["Vertical"] ?? "",
        width: json["Width"] ?? "",
        trigger: json["Trigger"] ?? "",
        comments: json["Comments"] ?? "",
      });
  }
  return { observations: observations, avalanches: avalanches };
}

export default downloadObservations;
export { getObservations };
