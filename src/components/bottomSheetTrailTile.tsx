import React from "react";
import { View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { TrailType } from "../generic_helpers/types";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { removeTrailFromTrails, setCurrentTrail } from "../trailState";
// import DropShadow from "react-native-drop-shadow";
import { AntDesign, Feather } from "@expo/vector-icons";
import { CameraRef } from "@rnmapbox/maps/lib/typescript/components/Camera";

export default function SheetTrailTile(props: { trail: TrailType; cameraRef: React.RefObject<CameraRef> }) {
  let dispatch = useDispatch();
  let trail = props.trail;
  return (
    // I'm commenting this stuff out for now on my branch because it's causing crashes.

    /** NOTE: I also tried another shadow package with react-native-svg, but it does't
    play nicely with the tile width: "auto", so we may have to either just use native
    android elevation or redo the styling to work with android API's */

    // <DropShadow
    //   style={{
    //     shadowColor: "#000",
    //     shadowOffset: {
    //       width: 2,
    //       height: 3,
    //     },
    //     shadowOpacity: 0.3,
    //     shadowRadius: 2,
    //   }}
    // >
    <View style={styles.mainContainer}>
      <View style={styles.trailNameContainer}>
        <TouchableOpacity onPress={() => console.log("View Trail Pressed")}>
          <Text style={styles.trailNameText}>{trail.trailName}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.selectButton} onPress={() => selectTrail()}>
        <AntDesign name="arrowup" size={20} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.selectButton} onPress={() => removeTrail()}>
        <Feather name="trash" size={20} color="black" />
      </TouchableOpacity>
    </View>
    // </DropShadow>
  );

  /**OPENS THE TRAIL using the Trail page with trail details */
  function openTrail() {
    //TODO finish function
  }

  function selectTrail() {
    //set this trail to currentTrail and remove it from the trail list
    dispatch(setCurrentTrail(trail));
    props.cameraRef.current?.fitBounds(trail.trailPoints[0], trail.trailPoints[trail.trailPoints.length - 1], 100, 1000);
  }

  function removeTrail() {
    dispatch(removeTrailFromTrails(trail));
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    height: 50,
    width: "auto",
    flex: 1,
    flexDirection: "row",
    alignContent: "space-between",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
    marginHorizontal: 10,
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 2,
    padding: 5,
    backgroundColor: "#E9E9E9",
    borderRadius: 5,
    // this is to offset turning off DropShadow above
    shadowOffset: { width: 2, height: 3, },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  selectButton: {
    borderStyle: "solid",
    borderColor: "black",

    height: 50,
    width: "auto",
    paddingHorizontal: 10,
    marginVertical: 2,
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  removeButton: {
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 1,
    height: 50,
    width: "auto",
    marginLeft: 5,
    paddingHorizontal: 10,
    marginVertical: 2,
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  trailNameContainer: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    textAlign: "center",
    width: "65%",
  },
  trailNameText: {
    fontSize: 20,
  },
});
