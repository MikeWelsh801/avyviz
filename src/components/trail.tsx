import MapboxGL, { CircleLayer, Images, LineLayer, MapView, PointAnnotation, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { Fragment } from "react";
import { Image, PanResponder, StyleSheet, View } from "react-native";
import { OnPressEvent } from "@rnmapbox/maps/lib/typescript/types/OnPressEvent";
import { filePaths, readFromFileSystem, writeToFileSystem } from "../generic_helpers/fileSystemHelpers";
import { EncodingType } from "expo-file-system/build/FileSystem.types";
import Toast from "react-native-root-toast";
import { MapMode, TrailType } from "../generic_helpers/types";
import { Position } from "geojson";
import { getAllDangers, getDangerInfo } from "../generic_helpers/trailHelpers";

const createGpx = require("gps-to-gpx").default;
const Trail = (props: { trail: TrailType | undefined; mapMode: MapMode; uid: string }) => {
  const [trailPoints, setTrailPoints] = useState<Position[]>();
  let lineHitbox = { width: 0, height: 0 };
  let pointHitbox = { width: 0, height: 0 };

  const [trailStyle, setTrailStyle] = useState<TrailStyle>({ lineColor: ['get', 'danger'], lineWidth: 4 });
  const [features, setFeatures] = useState<GeoJSON.FeatureCollection | undefined>(undefined);

  type TrailStyle = {
    lineColor: any;
    lineWidth: number;
  };

  // let gradient: any[] = ["interpolate", ["linear"], ["line-progress"]];
  async function calculateTrailGradient(trailPoints: Position[] | undefined) {
    setFeatures(undefined);
    if (trailPoints == undefined) return;

    const dangers = await getAllDangers(trailPoints);
    let featureCollection: GeoJSON.Feature[] = [];
    for (let i = 0; i < dangers.length - 1; i++) {
      const danger = dangers[i];
      featureCollection.push({
        type: 'Feature',
        id: i.toString(),
        geometry: {
          type: 'LineString',
          coordinates: [danger.coordinate, dangers[i + 1].coordinate],
        },
        properties: {
          danger: getDangerInfo(danger.danger).color,
        },
      });
    }
    setFeatures({ type: 'FeatureCollection', features: featureCollection });
  }

  useEffect(() => {
    setTrailPoints(props.trail?.trailPoints);
    //calculate the color gradient for the trail
    calculateTrailGradient(props.trail?.trailPoints);
  }, [props]);

  return (
    <Fragment>
      {/* THIS DRAWS THE LINES */}
      {trailPoints != undefined && trailPoints.length > 1
        && features != undefined && features.features.length > 1 && (
          <ShapeSource id={props.uid + "LineShapeSource"} shape={features} hitbox={lineHitbox} lineMetrics={true}>
            <LineLayer id={props.uid + "LineLayer"} style={trailStyle} layerIndex={121} />
            {/* THIS DRAWS THE TRAIL NAME */}
            <SymbolLayer
              id={props.uid + "Trail Text Layer"}
              style={{
                textField: props.trail?.trailName,
                textColor: "black",
                textHaloColor: "white",
                textHaloWidth: 2,
                textAllowOverlap: true,
                textJustify: "center",
                symbolPlacement: "line",
                textPitchAlignment: "viewport",
              }}
              layerIndex={122}
            ></SymbolLayer>
          </ShapeSource>
        )}
      {trailPoints != undefined && props.mapMode == MapMode.edit && (
        <ShapeSource id={props.uid + "PointShapeSource"} shape={{ type: "Feature", geometry: { type: "MultiPoint", coordinates: trailPoints }, properties: {} }} hitbox={pointHitbox}>
          <CircleLayer id={props.uid + "CircleLayer"} layerIndex={123} />
        </ShapeSource>
      )}
    </Fragment>
  );
};
export default Trail;

const styles = StyleSheet.create({
  markerContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  marker: {
    alignSelf: "flex-end",
    width: 40,
    height: 40,
  },
});
