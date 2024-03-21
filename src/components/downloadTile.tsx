import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { AvalancheCenter } from "../generic_helpers/avalancheCenterInfo";
import { filePaths, doesFileOrDirectoryExist, deleteFileOrDirectory, getFromBunny } from "../generic_helpers/fileSystemHelpers";
import FontAwesome from '@expo/vector-icons/FontAwesome'

/**
 * @param props - Information about the region avalanche center, etc.
 * @returns A tile with button for downloading region map.
 */
export default function DownloadTile(props: { regionName: string; estimatedSize?: number; avalancheCenter: AvalancheCenter }) {
  const [downloading, setDownloading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [downloadedOverlay, setDownloadedOverlay] = useState<boolean>(false);
  const [downloadPercent, setDownloadPercent] = useState(0);

  useEffect(() => {
    //check if the file has been downloaded on mount
    areOverlaysDownloaded();
  }, []);

  useEffect(() => {
    if (downloadPercent == 100) {
      setDownloading(false);
      setDownloadedOverlay(true);
      console.log("finished downloading");
    }
    }, [downloadPercent])


  return (
    <View style={style.container}>
      <Text style={style.title}>{props.regionName}</Text>
      {deleting && <Text>Deleting...</Text>}
      {downloading ? (
        <Text>{`Downloading... ${downloadPercent.toFixed(0)}% complete`}</Text>
      ) : (
        <View>
          {downloadedOverlay ? (
            <Pressable onPress={() => deleteButtonClicked()} style={style.deleteButton}>
              <Text>Delete Maps</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => downloadButtonClicked()} style={style.downloadButton}>
              <FontAwesome
                name="map"
                size={20}
                padding={3} />
              <Text>Download Maps</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );

  /** Set's state variables and starts download. */
  async function downloadButtonClicked() {
    console.log(props.regionName);
    setDownloading(true);
    try {
      console.log("start downloading");
      await downloadMap();
    } catch (error) {
      console.log("download failed");

      console.log(error);
    }
  }

  /** Sets state variables when user clicks delete. */
  async function deleteButtonClicked() {
    setDeleting(true);
    //this will delete the entire folder for all the overlays
    await deleteFileOrDirectory(filePaths.Overlays, `${props.regionName}/`);
    setDeleting(false);
    setDownloadedOverlay(false);
  }

  /** Checks if the maps are already downloaded. */
  async function areOverlaysDownloaded() {
    let overlaysDownloaded = await doesFileOrDirectoryExist(filePaths.Overlays, props.regionName);
    setDownloadedOverlay(overlaysDownloaded);
  }

  /** Downloads the map tiles for this region. */
  async function downloadMap() {
    //get overlay file from the CDN
    let path = `${props.avalancheCenter}_TILED_DATA`;
    await getFromBunny(filePaths.Overlays, path, props.regionName, setDownloadPercent);
    console.log(`downloaded tiles for ${props.regionName}`);
  }
}

const style = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "black",
    textAlign: "center",
    height: "auto",
    margin: 5,
    padding: 5,
  },
  downloadButton: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "black",
    borderRadius: 3,
    backgroundColor: "rgb(14,150,254)",
    padding: 2,
    marginBottom: 5,
  },
  deleteButton: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "black",
    borderRadius: 3,
    backgroundColor: "rgb(230,40,70)",
    padding: 2,
    marginBottom: 5,
  },
  title: {
    textAlign: "center",
    textTransform: "capitalize",
    marginBottom: 5,
  },
});
