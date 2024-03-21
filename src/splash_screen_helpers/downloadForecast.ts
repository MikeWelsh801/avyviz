import { collection, getDoc, getDocs, limit, orderBy, query } from "firebase/firestore";
import { getTodaysDate, standards, timeZones } from "../generic_helpers/getTodaysDate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../Firebase";
import { getAvalancheCenterRegions, AvalancheCenter } from "../generic_helpers/avalancheCenterInfo";
import * as FileSystem from "expo-file-system";
import { writeToFileSystem, filePaths, readFromFileSystem } from "../generic_helpers/fileSystemHelpers";

/**
 * downloads newest possible forecast.
 * @param avalancheCenter Avalanche center to download data for.
 */
async function downloadForecast(avalancheCenter: AvalancheCenter) {
  let regions = getAvalancheCenterRegions(avalancheCenter);
  let currentDate = getTodaysDate(standards.US, timeZones.MST);
  regions.forEach(async (region) => {
    let forecastRef = collection(db, `UAC/forecast/${region}`);
    let forecastQuery = query(forecastRef, orderBy("date_issued_timestamp", "desc"), limit(1));

    let snapshot = await getDocs(forecastQuery);
    let forecast = snapshot.docs[0].data();
    //write forecast to file
    await writeToFileSystem(filePaths.UACForecast, `${region}.json`, JSON.stringify(forecast), FileSystem.EncodingType.UTF8);
  });
}

export default downloadForecast;
