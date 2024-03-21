import * as FileSystem from "expo-file-system";
import { AvalancheCenter } from "./avalancheCenterInfo";

enum filePaths {
  UACForecast = `${AvalancheCenter.UAC}/forecasts/`,
  User = "User/",
  Downloads = "Downloads/",
  UACObservations = `${AvalancheCenter.UAC}/Observations/`,
  UACAvalanches = `${AvalancheCenter.UAC}/Avalanches/`,
  Overlays = "Downloads/Overlays/",
  UserTrailData = `User/`,
  Trails = `Trails/`
}

type Downloads = {
  [key in string]: number
}

let downloads: Downloads = {
  "salt-lake": 0,
  "logan": 0,
  "abajos": 0,
  "moab": 0,
  "ogden": 0,
  "provo": 0,
  "skyline": 0,
  "southwest": 0,
  "uintas": 0,
};

/**
 *This method will write a string containing all the contents of the file inputted. If the directory does not exist it will make it.
 * @param path path starting after FileSystem.documentDirectory/ this path needs to end with a /
 * @example "UAC/forecast/salt-lake/"
 * @param fileName filename of the file written WITH file extension
 * @example "fileName.json"
 * @param data data as a string to write to file
 * @param encoding (optional) encoding type of data
 */
async function writeToFileSystem(path: filePaths, fileName: string, data: string, encoding?: FileSystem.EncodingType | undefined) {
  try {
    let dir = `${FileSystem.documentDirectory}${path}`;

    let dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    let fullPath = `${dir}${fileName}`;
    await FileSystem.writeAsStringAsync(fullPath, data, { encoding: encoding });
  } catch (error) {
    console.error(error);
  }
}

/**
 * This function downloads an entire region of map data and updates the download percentage
 * as bunny responds
 *
 * @param localPath - the filePath of the file system
 * @param path - the bunny cdn path to the map data
 * @param region - the map region to download
 * @param setDownloadPercent - a callback to update the percentage of the way through the download
 */
async function getFromBunny(localPath: filePaths, path: string, region: string, setDownloadPercent: React.Dispatch<React.SetStateAction<number>>) {
  downloads[region] = 0;
  let remote = `${path}/${region}/`;
  let dir = `${FileSystem.documentDirectory}${localPath}${region}/`;
  console.log(region);

  let dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      AccessKey: '29b09393-81f2-4aed-8e679d592197-647d-4703'
    }
  };

  // get a list of all of the files in this region
  let response = await fetch(`https://storage.bunnycdn.com/avy-viz-storage/${remote}`, options)
    .then(response => response.json())
    .catch(err => console.error(err));

  for (let index = 0; index < response.length; index++) {
    // download all tiles for this region
    const fileName = response[index]["ObjectName"];
    let fullPath = `${dir}${fileName}`
    let fullRemotePath = `https://avy-viz-cdn.b-cdn.net/${remote}${fileName}`
    // let all the files download concurrently but stall on the last one
    FileSystem.downloadAsync(fullRemotePath, fullPath)
      .then(() => {
        // update the download percentage
        downloads[region]++;
        const percent = downloads[region] / response.length * 100;
        setDownloadPercent(percent);
      })
      .catch(error => console.log(error));
  }
}

/**
 * This method will return a string containing all the contents of the file requested.
 * if the file does not exist it returns an empty string
 * @param path path starting after FileSystem.documentDirectory/ this path needs to end with a /
 * @example "UAC/forecast/salt-lake/"
 * @param fileName filename of the file written WITH file extension
 * @example "fileName.json"
 * @param encoding (optional) encoding type of data
 */
async function readFromFileSystem(path: filePaths, fileName: string, encoding?: FileSystem.EncodingType): Promise<string> {
  let dir = `${FileSystem.documentDirectory}${path}`;
  let dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    return "";
  } else {
    let data = await FileSystem.readAsStringAsync(`${dir}${fileName}`, { encoding: encoding });
    return data;
  }
}


/*
 * Gets a list of filenames in the given directory.
 */
async function readAllFiles(path: string): Promise<string[]> {
  let dir = `${FileSystem.documentDirectory}${path}`;
  let dirInfo = await FileSystem.getInfoAsync(dir);

  if (!dirInfo.exists){
    // console.log(dir)
    return []
  }
   

  return await FileSystem.readDirectoryAsync(dir)
}

/**
 *Checks if a path exists helpful to see if the app already contains data.
 * @param path path to check if it exist
 * @param fileName optional parameter if you want to check if the file exists inside the directory
 * @returns if the path/file exists
 */
async function doesFileOrDirectoryExist(path: filePaths, fileName?: string) {
  if (fileName == undefined) {
    fileName = "";
  }
  let dir = `${FileSystem.documentDirectory}${path}${fileName}`;
  let dirInfo = await FileSystem.getInfoAsync(dir);
  return dirInfo.exists;
}

/**
 * This function is a wrapper to delete files in a directory easily.
 * @param path path to delete at or delete
 * @param fineName path to file and Name to delete (optional)
 */
async function deleteFileOrDirectory(path: filePaths, fileName?: string) {
  if (fileName == undefined) {
    fileName = "";
  }
  let dir = `${FileSystem.documentDirectory}${path}${fileName}`;
  if ((await FileSystem.getInfoAsync(dir)).exists) {
    await FileSystem.deleteAsync(dir);
    console.log("deleted the file or dir @ ", dir);
  } else {
    console.log("No file or dir exists to delete");
  }
}

export { getFromBunny, writeToFileSystem, filePaths, readFromFileSystem, doesFileOrDirectoryExist, deleteFileOrDirectory, readAllFiles, downloads };
