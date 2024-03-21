import { StyleSheet, View, Alert, Text } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import MapView, { Region, MapPressEvent, Overlay } from 'react-native-maps'
import { PROVIDER_GOOGLE } from 'react-native-maps'
import * as Location from 'expo-location'
import Trail from './trail'
import SaveButton from './saveButton'
import { filePaths, readFromFileSystem, writeToFileSystem } from '../generic_helpers/fileSystemHelpers'
import { getDangerRating, getMapData } from '../generic_helpers/trailHelpers'
import { EncodingType } from 'expo-file-system'

type MapProps = {
  fileName: string
}

export default function Map(prop: MapProps) {
  // I think setting it up this way will allow updating for the initial region
  // some default if the user doesn't allow the location
  let [region, setRegion] = useState<Region>({
    "latitude": 40.593581094880406,
    "latitudeDelta": 0.262757936783089,
    "longitude": -111.61305651068687,
    "longitudeDelta": 0.1945466548204422
  });
  // this allows the user to name their trails
  let [gpxName, setGpxName] = useState<string>("My Trail")

  const trailRef = useRef<{
    onPressHandler(event: MapPressEvent): Promise<void>,
    getGpx(): string,
    reloadGpx(): void,
    loadNewTrail(gpx: string): void
  }>()

  // asks for permission to use the user's location then set's the location
  // in for the initial region
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      // nope, just show them Snowbird
      if (status !== 'granted') {
        console.error('Permission to access location was denied');

        return;
      }

      // hey, the user is being cool. Get their location and update the map
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.Balanced
      });

      region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      }
      setRegion(region);

    })();
  }, []);

  /*
   * This use effect relies on the filename passed in and is used to change the 
   * trail that is rendered on the screen.
   */
  useEffect(() => {
    (async () => {
      if (prop.fileName === 'none') {
        return;
      }

      let gpx = await readFromFileSystem(filePaths.UserTrailData, prop.fileName, EncodingType.UTF8)
      let gpxName = prop.fileName.replaceAll("-", " ").split(".gpx")[0]
      setGpxName(gpxName)
      trailRef.current?.loadNewTrail(gpx)

    })();
  }, [prop.fileName])

  /*
   * Writes the gpx to the file system with whatever name is passed in.
   */
  async function saveGpx(name: string) {
    let fileName = name.replaceAll(" ", "-") + ".gpx"
    let gpxStr = trailRef.current ? trailRef.current.getGpx() : "none"
    // for testing
    await writeToFileSystem(filePaths.UserTrailData, fileName, gpxStr, EncodingType.UTF8)
  }

  /*
   * Allows user to name the current trail.
   */
  function saveGpxAs() {
    Alert.prompt("Save as", "What would you like to name your trail?",
      [
        {
          text: "Cancel"
        },
        {
          text: "Save",
          onPress: async (trailName) => {
            if (trailName !== undefined) {
              setGpxName(trailName)
              trailRef.current?.reloadGpx()
              saveGpx(trailName)
            }
          }
        }
      ])

  }

  /*
   * Updates the region if the zoom is over a certain amount.
   * Used for updating the press distance on markers.
   *
   * NOTE: You don't want to update the region every time because
   * it makes the map sloooow and jittery.
   */
  async function updateRegion(location: Region) {
    if (Math.abs(location.latitudeDelta - region.latitudeDelta) > 0.8 * region.longitudeDelta 
      || Math.abs(location.longitudeDelta - region.longitudeDelta) > 0.8 * region.latitudeDelta) {
      setRegion(location)
    }
  }

  return (
    <View style={styles.container}>
      <MapView provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType='terrain'

        // sets the initial location to the user's location if they give the
        // app permission. If not, it just starts off over big and little
        // cottonwood
        region={region}

        // this creates a location button that centers on the user
        showsUserLocation={true}
        showsMyLocationButton={true}
        mapPadding={styles.mapPadding}
        onRegionChange={updateRegion}
        // register handler for making a route
        onPress={async (event: MapPressEvent) => {
          await trailRef.current?.onPressHandler(event)
        }}

      /* Apparently this only works on apple maps */
      // followsUserLocation={true}
      // cacheEnabled={true}
      >
        <Overlay image={require('../../assets/abajos_aspect.png')}
          bounds={[
            [-109.8441356, 37.9599758],
            [-109.4210291, 37.68051],
          ]}
          opacity={1} />
        <Trail region={region} name={gpxName} ref={trailRef} />
      </MapView>
      <SaveButton onPressHandler={saveGpxAs} />
      <Text style={styles.trailName}>{" " + gpxName + " "}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: 'flex-start',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPadding: {
    top: 0,
    right: 10,
    left: 0,
    bottom: 70,
  },
  trailName: {
    fontSize: 30,
    marginTop: 6,
    fontWeight: "700",
    shadowColor: "black",
    shadowOffset: { height: 7, width: 5 },
    shadowOpacity: 0.5,
    color: "black",
    borderColor: "black",
    borderWidth: 3,
    borderRadius: 10,
  }
})
