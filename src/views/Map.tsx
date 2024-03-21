import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, TouchableOpacity, Image, Button, TextInput, Pressable, PanResponder, FlatList, Platform, Keyboard } from "react-native";
import React, { useEffect, useReducer, useRef, useState } from "react";
import MapboxGL, { MapView, Camera, UserLocation, PointAnnotation, ShapeSource, VectorSource, LineLayer, RasterLayer, RasterSource, MarkerView, Annotation, SymbolLayer, Images } from "@rnmapbox/maps";
import * as Location from "expo-location";
import Trail from "../components/trail";
import Toast from "react-native-root-toast";
import { useIsFocused } from "@react-navigation/native";
import { Keys, LatLong, MapMode, TrailOriginType, TrailType, pointerEventsTypes } from "../generic_helpers/types";
import { Feature, GeoJsonProperties, Geometry, Position } from "geojson";
import { filePaths, writeToFileSystem } from "../generic_helpers/fileSystemHelpers";
import { Gesture, GestureDetector, ScrollView } from "react-native-gesture-handler";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { addTrailToTrails, setCurrentTrail } from "../trailState";
import BottomSheet from "@gorhom/bottom-sheet";
import { store } from "../store";
import SheetTrailTile from "../components/bottomSheetTrailTile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { color } from "../../assets/colors";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { AveProps, ObsProps } from "../components/mapPopup";
import MapObservations from "../components/mapObservations";
import { getObservations } from "../splash_screen_helpers/downloadObservations";
import { convertAspect, getDangerInfo, getDangerRating, getMapData, getTrailStats, metersToFeet, trailDistance } from "../generic_helpers/trailHelpers";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const createGpx = require("gps-to-gpx").default;

export default function Map({ route, navigation }: any) {
  //init the settings of the map
  //don't worry about this key. Its just the public key
  MapboxGL.setAccessToken("pk.eyJ1IjoiYXZ5dml6IiwiYSI6ImNscGhiZWp3ajAxa2UyaW55cm03bWdjZ3YifQ.UoTfVR_Cdz7HFzmHXqsw3g");

  const [mapMode, setMapMode] = useState<MapMode>(MapMode.view);
  const [userLocation, setUserLocation] = useState<number[]>([0, 0]);
  const [currentDanger, setCurrentDanger] = useState<string>("Unknown");
  const [currentSlopeAngle, setCurrentSlopeAngle] = useState<number>(0);
  const [currentAspect, setCurrentAspect] = useState<number>(0);
  const [currentElevation, setCurrentElevation] = useState<number>(0);
  const [currentDangerColor, setCurrentDangerColor] = useState<string>(color.LightBG);

  const isFocused = useIsFocused();
  const userLocationRef = useRef<UserLocation>(null);
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [enableMapPan, setEnableMapPan] = useState<boolean>(true);
  const [editingTrail, setEditingTrail] = useState<TrailType | undefined>(undefined);
  //this temp trail is used to save the state of the editingTrail before its saved
  const [tmp, setTmpTrail] = useState<TrailType | undefined>(undefined);
  const trails = useSelector((state: any) => state.globalTrailsState.trails, shallowEqual);

  const currentTrail: TrailType = useSelector((state: any) => state.globalTrailsState.currentTrail, shallowEqual);

  const dispatch = useDispatch();

  // observations and avalanches, I needed to keep this here because it's a lot easier
  // if the map manages where popups and icons are located and clicked
  const [observations, setObservations] = useState<ObsProps[]>([]);
  const [avalanches, setAvalanches] = useState<AveProps[]>([]);
  const [obsPopup, setObsPopup] = useState<ObsProps | undefined>(undefined);
  const [avePopup, setAvePopup] = useState<AveProps | undefined>(undefined);

  //CAMERA SETTINGS
  const camera = useRef<Camera>(null);
  const [cameraCenter, setCameraCenter] = useState<Position>([111.891, 40.7608]);

  //THIS HANDLES ALL THE CODE WITH PRESSING

  const drag = Gesture.Pan();
  drag.maxPointers(1);
  //For some reason the pan gesture needs a long press for it to work on android
  if (Platform.OS == "android") {
    drag.activateAfterLongPress(2000);
  }

  // drag.onBegin(async (event) => {
  //   //on the start of the drag I want to see if its on a editingTrail point in edit mode. If it is then I want to stop the ability for movement to go to the map.
  //   // let point: Position | undefined = [0, 0];
  //   // point = await mapRef.current?.getCoordinateFromView([event.x, event.y]);
  //   // console.log("point", point);
  //   // if (point == undefined) {
  //   //   return;
  //   // }
  //   // let clickedOnPoint = await clickedOnTrailPoint(point);
  //   // if (event.numberOfPointers == 1 && clickedOnPoint.passed == true) {
  //   //   console.log("clicked on point", clickedOnPoint.index);
  //   //   // setAllowMapTouches(pointerEventsTypes.dontAllowTouches);
  //   //   setEnableMapPan(false);
  //   // }
  // });
  // .activateAfterLongPress(200);
  //this line bellow allows the user to long press on android but not on IOS. How can I fix this?

  // .activateAfterLongPress(400);

  // drag.onChange((event) => {});
  // drag.onFinalize((event, suc) => {
  //   // setAllowMapTouches(pointerEventsTypes.allowTouches);

  //   setEnableMapPan(true);
  //   console.log(enableMapPan);
  // });

  const composed = Gesture.Simultaneous(drag);
  //THIS HANDLES ALL THE CODE WITH PRESSING

  useEffect(() => {
    console.log("in use effect");

    let loadLocation = async () => {
      let foregroundStatus = (await Location.requestForegroundPermissionsAsync()).status;

      let backgroundStatus = (await Location.requestBackgroundPermissionsAsync()).status;
      // TODO: location is really slow on my emulator, so I changed this for testing
      // change back !!!
      if (foregroundStatus === "granted" && backgroundStatus == "granted") {
        // do this because general location is good enough for loading observations
        // load the accurate location for app tracking
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.LocationAccuracy.High
        });
        setUserLocation([location.coords.longitude, location.coords.latitude]);
        recenterCamera();

      } else {

      }
    };
    let loadObservations = async () => {
      let data = await getObservations();
      setObservations(data.observations);
      setAvalanches(data.avalanches)
    };
    loadObservations();
    loadLocation();
  }, [isFocused]);

  useEffect(() => {
    if (route.params !== undefined) {
      let params = route.params;
      if (params.type == "observation") {
        let obs = observations.find((obs) => obs.id == params.id);
        setAvePopup(undefined);
        setObsPopup(obs);
        let newCamera = [obs!.position[0], obs!.position[1]];
        camera.current?.setCamera({ centerCoordinate: newCamera, animationMode: "easeTo", pitch: 40 });
      } else {
        let ave = avalanches.find((ave) => ave.id == params.id);
        setAvePopup(ave);
        setObsPopup(undefined);
        let newCamera = [ave!.position[0], ave!.position[1]];
        camera.current?.setCamera({ centerCoordinate: newCamera, animationMode: "easeTo", pitch: 40 });
      }
    }
  }, [route])

  return (
    <SafeAreaView style={styles.container}>
      {/* THIS IS FOR THE CURRENT DANGER BAR AT THE TOP OF THE SCREEN */}

      <View style={styles.headerContainer}>
        <View style={styles.currentStatsContainer}>
          <View style={styles.currentSlopeAngleContainer}>
            <Text>
              {currentSlopeAngle}°
              <MaterialCommunityIcons name="angle-acute" size={18} color="black" />
            </Text>
          </View>

          <View style={styles.currentElevationContainer}>
            <Text>{currentElevation}ft</Text>
          </View>
          <View style={styles.currentAspectContainer}>
            <Text>{convertAspect(currentAspect)[0]}</Text>
          </View>
        </View>
        <View style={[styles.currentDangerContainer, { backgroundColor: currentDangerColor }]}>
          {currentDangerColor == color.Black ? <Text style={{ color: "white" }}>{currentDanger}</Text> : <Text>{currentDanger}</Text>}
        </View>
      </View>

      <View style={styles.fullMapContainer}>
        {/* THIS IS THE CODE TO SHOW THE editingTrail SAVE BAR */}
        {mapMode == MapMode.edit && (
          <View style={styles.trailSaveBarContainer}>
            <View style={styles.trailSaveBar}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => cancelPressed()}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TextInput placeholder="Trail Name" style={styles.trailName} value={editingTrail?.trailName} onChangeText={(newTrailName) => changeTrailName(newTrailName)}></TextInput>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  saveButtonPressed();
                }}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* MAP CODE BELOW */}

        <GestureDetector gesture={composed}>
          <View style={styles.mapContainer}>
            <MapView
              styleURL="mapbox://styles/avyviz/clpj0zfbl007701pq29e0dn8x"
              style={styles.map}
              compassEnabled={true}
              projection="mercator"
              onDidFinishLoadingStyle={() => mapLoaded()}
              ref={mapRef}
              pitchEnabled={true}
              onLongPress={(e) => createNewTrail(e)}
              onPress={async (e) => shortPress(e)}
              scrollEnabled={enableMapPan}
            >
              {Location.PermissionStatus.GRANTED && <UserLocation showsUserHeadingIndicator={true} ref={userLocationRef} onUpdate={() => updateUserLocation()} />}

              {/* THIS SHOWS ALL OF THE OBSERVATIONS AND AVALANCHES */}
              <MapObservations
                greyImage={editingTrail !== undefined}
                camera={camera}
                avalanches={avalanches}
                observations={observations}
                avePopup={avePopup}
                obsPopup={obsPopup}
                navigation={navigation}
                setAvePopupHander={(ave) => {
                  if (!editingTrail) setAvePopup(ave);
                }}
                setObsPopupHandler={(obs) => {
                  if (!editingTrail) setObsPopup(obs);
                }}
                onPopupCloseHandler={() => {
                  setAvePopup(undefined);
                  setObsPopup(undefined);
                }} />


              <Camera ref={camera} centerCoordinate={cameraCenter} animationMode="none" animationDuration={0} />
              {/* THIS IS USED TO SHOW THE CURRENT TRAIL */}
              {mapMode == MapMode.view && currentTrail != undefined && editingTrail?.uid != currentTrail?.uid && <Trail trail={currentTrail} mapMode={MapMode.view} uid={"Current Trail"} />}
              {/* THIS IS TO SHOW THE OTHER TRAILS */}
              {trails.map((trail: TrailType, index: number) => {
                return <Trail trail={trail} mapMode={MapMode.view} key={index} uid={`Trail ${index}`} />;
              })}
              {/* THIS IS USED TO SHOW THE editingTrail WHEN EDITING IT */}
              <Trail trail={editingTrail} mapMode={mapMode} uid={"Editing Trail"} />
            </MapView>
          </View>
        </GestureDetector>

        {/* THIS IS THE CODE FOR THE RECENTER BUTTON */}
        <TouchableOpacity style={styles.recenterButton} onPress={() => recenterCamera()}>
          <Image source={require("../../assets/re-center-icon.png")} style={styles.recenterButtonIcon} />
        </TouchableOpacity>
      </View>

      {/* SLIDE UP BOTTOM SHEET SECTION */}

      <BottomSheet snapPoints={["10%", "50%", "90%"]} ref={bottomSheetRef} animateOnMount={false} android_keyboardInputMode="adjustPan">
        <View style={styles.bottomSheetContainer}>
          <View style={styles.currentTrailBottomSheetContainer}>
            {currentTrail == undefined ? (
              <Text style={styles.currentTrailBottomSheetText}>No Current Trail</Text>
            ) : (
              <View style={styles.currentTrailContainer}>
                <View style={styles.currentTrailTextContainer}>
                  <TouchableOpacity onPress={() => focusOnTrail(currentTrail)}>
                    <Text style={styles.currentTrailBottomSheetText}>{currentTrail.trailName}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.currentTrailSettingsContainer}>
                  <TouchableOpacity
                    style={styles.currentTrailInfoButton}
                    onPress={() => navigation.navigate("Trails", { trail: currentTrail.uid, trailType: currentTrail.type })}>
                    <Feather name="info" size={30} color="black" style={{ textAlign: "center" }} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.currentTrailEditButton} onPress={() => editButtonPressed()}>
                    <AntDesign name="edit" size={30} color="black" style={{ textAlign: "center" }} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.currentTrailRemoveButton} onPress={() => removeCurrentTrail()}>
                    <Feather name="trash" size={24} color="black" style={{ textAlign: "center" }} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          <ScrollView style={styles.trailsList}>
            {trails.map((trail: TrailType, index: number) => (
              <SheetTrailTile trail={trail} key={index} cameraRef={camera} />
            ))}
          </ScrollView>
        </View>
      </BottomSheet>

      <StatusBar style="auto" />
    </SafeAreaView>
  );

  function focusOnTrail(trail: TrailType) {
    if (trail != undefined) {
      let bounds = [trail.trailPoints[0], trail.trailPoints[trail.trailPoints.length - 1]];
      camera.current?.fitBounds(bounds[0], bounds[1], 100, 1000);
    }
  }

  function editButtonPressed() {
    console.log("edit button pressed");

    if (currentTrail != undefined) {
      setEditingTrail(currentTrail);
      setMapMode(MapMode.edit);
    }
    bottomSheetRef.current?.snapToIndex(0);
    focusOnTrail(currentTrail!);
  }

  function removeCurrentTrail() {
    dispatch(setCurrentTrail(undefined));
    if (trails.length > 0) {
      dispatch(setCurrentTrail(trails[0]));
    }
    focusOnTrail(trails[0]);
  }

  //editingTrail FUNCTIONS START HERE
  function changeTrailName(newTrailName: string) {
    if (editingTrail != undefined) {
      setEditingTrail({ ...editingTrail, trailName: newTrailName });
    }
  }
  /**
   * Save the current editingTrail.
   */
  function saveButtonPressed() {
    setMapMode(MapMode.view);
    saveTrail();
  }

  function cancelPressed() {
    setMapMode(MapMode.view);
    setEditingTrail(undefined);
  }

  /**
   * Creates a new editingTrail.
   */
  async function createNewTrail(e: any) {
    setObsPopup(undefined); // make any popups disappear
    setAvePopup(undefined);

    if (mapMode == MapMode.edit) {
      console.log("Already in Map Mode");
      return;
    }
    setMapMode(MapMode.edit);
    //set a new trail as the current trail
    //look at the phone stored ids and assign it an id that is not taken
    //this is a comma separated string of all the trail ids
    let trailUIDs = await AsyncStorage.getItem(Keys.trailUIDs);
    let trailUIDsArray = trailUIDs?.split(",");
    //loop trough array and find gaps if their are any
    let newUID = -1;
    if (trailUIDsArray != undefined) {
      for (let i = 0; i < trailUIDsArray.length; i++) {
        if (trailUIDsArray[i] != "" + i) {
          newUID = i;
        }
      }
      if (newUID == -1) {
        newUID = trailUIDsArray.length;
      }
    }
    //save new trailUIDs string array
    if (trailUIDs == null) {
      trailUIDs = "" + newUID;
    } else {
      trailUIDs = trailUIDs + "," + newUID;
    }
    await AsyncStorage.setItem(Keys.trailUIDs, trailUIDs);

    let coords = e.geometry.coordinates;
    console.log("coords", coords);
    let point = [coords[0], coords[1]];

    let newTrail: TrailType = {
      uid: newUID,
      trailName: "",
      trailPoints: [point],
      trailDescription: "",
      type: TrailOriginType.user,
      editing: true,
      editable: true,
      region: "",
      state: "",
      totalDistance: { miles: 0, km: 0 },
      elevationGain: 0,
      elevationLoss: 0,
      averageSlope: -9999,
      averageAspect: -9999,
    };

    setEditingTrail(newTrail);
  }

  async function saveTrail() {
    if (editingTrail?.trailName == undefined || editingTrail?.trailName == "") {
      displayToastOnMap("Please enter a trail name", "rgba(0,0,0,0.5)");
      return;
    }

    if (currentTrail != undefined) {
      dispatch(addTrailToTrails(currentTrail));
    }
    // recalculate all of the stats
    await calculateStats(editingTrail);
    dispatch(setCurrentTrail(editingTrail));
    await writeToFileSystem(filePaths.Trails, `${editingTrail?.uid}`, JSON.stringify(editingTrail));
    displayToastOnMap("Saved Trail", "rgba(34,139,34,1)");
    setEditingTrail(undefined);
  }

  /**
   * @param trail - Recalculates the stats for the input trail.
   */
  async function calculateStats(trail: TrailType) {
    let latlng = trail.trailPoints.map((point) => {
      return { longitude: point[0], latitude: point[1] };
    });
    let stats = await getTrailStats(latlng);
    trail.totalDistance = trailDistance(latlng);
    trail.averageSlope = stats.aveSlope;
    trail.averageAspect = stats.aveAspect;
    trail.elevationGain = stats.elevationGain;
    trail.elevationLoss = stats.elevationLoss;
  }

  function displayToastOnMap(msg: string, backgroundColor?: string) {
    Toast.show(msg, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.CENTER,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      backgroundColor: backgroundColor,
    });
  }

  //editingTrail FUNCTIONS END HERE

  //MAP MANAGEMENT FUNCTIONS START HERE

  /**
   * Moves the camera once the map is loaded.
   */
  function mapLoaded() {
    recenterCamera();
    bottomSheetRef.current?.snapToIndex(0);
  }

  /**
   * Updates the camera position
   * @param param0 camera param object that updates the camera position.
   */
  function updateCamera({
    zoomLevel,
    centerCoordinate,
    animationMode,
    heading,
    pitch,
  }: {
    zoomLevel: number;
    centerCoordinate: number[];
    animationMode: "easeTo" | "flyTo";
    heading: number;
    pitch: number;
  }) {
    camera.current?.setCamera({ zoomLevel: zoomLevel, centerCoordinate: centerCoordinate, animationMode: animationMode, heading: heading, pitch: pitch });
  }

  /**
   * Centers camera to user location and makes the pitch 0
   */
  function recenterCamera() {
    setCameraCenter(userLocation);
    camera.current?.setCamera({ zoomLevel: 12, centerCoordinate: cameraCenter, animationMode: "easeTo", heading: 0, pitch: 0 });
  }

  /**
   *Gets the info of the given coord point
   * @param coords lat long object.
   */
  function getPointInfo(coords: LatLong) {
    console.log("checking info on:", coords);
  }

  /**
   * Changes the mode the map is in.
   */
  // function changeMapMode() {
  //   if (mapMode == MapMode.view) {
  //     setMapMode(MapMode.edit);
  //     seteditingTrail({ ...editingTrail });
  //   }
  // }

  /**
   *Updates the user location state when the map user location changes.
   */
  async function updateUserLocation() {
    if (userLocationRef.current?.state.coordinates != null && userLocationRef.current.state.coordinates != undefined) {
      setUserLocation(userLocationRef.current?.state.coordinates);
      console.log("user location updated", userLocationRef.current?.state.coordinates);

      let currentCoords: LatLong = { latitude: userLocationRef.current?.state.coordinates[1], longitude: userLocationRef.current?.state.coordinates[0] };
      let data = await getMapData(currentCoords);
      let danger = await getDangerRating(currentCoords);
      let dangerInfo = await getDangerInfo(danger);
      setCurrentDanger(dangerInfo.shortDescription);
      setCurrentDangerColor(dangerInfo.color);
      if (data != undefined) {
        setCurrentAspect(data?.aspect);
        setCurrentSlopeAngle(data?.slope);
        setCurrentElevation(metersToFeet(data?.elevation));
      } else {
        setCurrentAspect(-9999);
        setCurrentSlopeAngle(-9999);
        setCurrentElevation(-9999);
      }
    }
  }
  /**
   * Short press on the map.
   * @param e event
   */
  async function shortPress(e: any) {
    let coords = e.geometry.coordinates;

    setObsPopup(undefined); // make any popups dissapear
    setAvePopup(undefined);
    let point = [coords[0], coords[1]];
    if (mapMode == MapMode.edit) {
      //see if its on a point to delete it
      if ((await clickedOnTrailPoint(point)).passed == true) {
        //delete point
        removePoint((await clickedOnTrailPoint(point)).index);
      } else {
        addPointToTrail(point);
      }
    }
  }

  async function clickedOnTrailPoint(point: number[]) {
    //convert point to screen space
    const hitbox = 10;

    let screenPointClicked = await mapRef.current?.getPointInView(point);
    if (editingTrail?.trailPoints == undefined || mapRef.current == null || screenPointClicked == undefined) {
      return { passed: false, index: -1 };
    }
    for (let i = 0; i < editingTrail.trailPoints.length; i++) {
      let trailScreenPoint = await mapRef.current.getPointInView(editingTrail.trailPoints[i]);

      if (trailScreenPoint != undefined) {
        let xDif = Math.abs(trailScreenPoint[0] - screenPointClicked[0]);
        let yDif = Math.abs(trailScreenPoint[1] - screenPointClicked[1]);

        if (xDif < hitbox && yDif < hitbox) {
          return { passed: true, index: i };
        }
      }
    }
    return { passed: false, index: -1 };
  }

  function removePoint(index: number) {
    if (editingTrail != undefined) {
      let trailPointsCopy = [...editingTrail.trailPoints];
      trailPointsCopy.splice(index, 1);

      setEditingTrail({ ...editingTrail, trailPoints: trailPointsCopy });
    }
  }

  function clickedTrailPoint(screenPoint: number[]) {
    console.log("test call with value: ", screenPoint);
  }

  function addPointToTrail(point: number[]) {
    if (editingTrail !== undefined) {
      let updatedTrailPoints = [...editingTrail.trailPoints, point];
      setEditingTrail({ ...editingTrail, trailPoints: updatedTrailPoints });
    }
  }
}

//MAP MANAGEMENT FUNCTIONS END HERE

const styles = StyleSheet.create({
  popUpContainer: {
    width: 150,
    height: 150,
    borderColor: color.Blue,
    borderWidth: 0.5,
    borderRadius: 12,
    backgroundColor: color.LightBlue,
    justifyContent: "center",
    padding: 30,
    elevation: 10,
  },
  container: {
    height: "100%",
  },
  map: {
    flex: 1,
    height: "100%",
  },
  fullMapContainer: {
    height: "90%",
  },
  mapContainer: {
    flex: 1,
  },
  recenterButton: {
    position: "absolute",
    top: "80%",
    left: "85%",
  },
  recenterButtonIcon: {
    width: 50,
    height: 50,
    backgroundColor: "white",
    borderRadius: 100,
  },
  trailSaveBarContainer: {
    borderBottomWidth: 2,
    minHeight: 36,
  },
  trailSaveBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: "5%",
  },
  saveButton: {
    borderRadius: 2,
  },

  cancelText: {
    fontSize: 20,
    color: "red",
  },
  saveText: {
    fontSize: 20,
    color: "green",
  },
  cancelButton: {
    borderRadius: 2,
  },
  trailName: {
    fontSize: 20,
  },
  bottomSheetContainer: {
    flex: 1,
    flexDirection: "column",
    marginHorizontal: "5%",
  },

  currentTrailBottomSheetText: {
    fontSize: 30,
    width: "100%",
    textAlign: "center",
    color: "black",
  },
  currentTrailBottomSheetContainer: {
    height: "auto",
    width: "100%",
    marginBottom: 20,
  },
  trailsList: {
    flex: 1,
    height: "auto",
  },

  currentTrailEditButton: {
    flex: 1,
    height: 50,
    width: "33%",
    verticalAlign: "center",
    alignContent: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "gray",
  },
  currentTrailRemoveButton: {
    flex: 1,
    height: 50,
    width: "33%",
    verticalAlign: "center",
    alignContent: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderColor: "gray",
  },
  currentTrailInfoButton: {
    flex: 1,
    height: 50,
    width: "33%",
    verticalAlign: "center",
    alignContent: "center",
    justifyContent: "center",

    borderRightWidth: 1,
    borderColor: "gray",
  },
  currentTrailButton: {
    height: 50,
    width: "100%",
  },
  currentTrailContainer: {
    flex: 0,
    flexDirection: "column",
    alignContent: "space-between",
    justifyContent: "space-between",
  },

  currentTrailSettingsContainer: {
    flex: 0,
    flexDirection: "row",
    alignContent: "space-between",
    justifyContent: "space-between",
  },

  currentTrailTextContainer: {
    marginBottom: 10,
    height: 50,
  },
  headerContainer: {
    flex: 1,
    height: "10%",
    width: "100%",
  },
  currentStatsContainer: {
    flex: 1,
    flexDirection: "row",
    height: "50%",
    // marginLeft: "20%",
    // paddingRight: "10%",
    paddingHorizontal: "10%",
    justifyContent: "space-around",
    alignContent: "space-around",
    alignItems: "center",
    verticalAlign: "top",
  },

  currentDangerContainer: {
    flex: 1,
    height: "50%",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    verticalAlign: "middle",
  },

  currentElevationContainer: {},
  currentAspectContainer: {},
  currentSlopeAngleContainer: {},
});
