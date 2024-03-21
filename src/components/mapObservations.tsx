import React, { Fragment, useState } from 'react'
import MapPopup, { AveProps, ObsProps, popupType } from './mapPopup';
import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/types/OnPressEvent';
import { CameraRef } from '@rnmapbox/maps/lib/typescript/components/Camera';
import { Images, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
import { getRegionName } from '../generic_helpers/trailHelpers';

type mapObsProps = {
  greyImage: boolean,
  camera: React.RefObject<CameraRef>
  observations: ObsProps[],
  avalanches: AveProps[]
  avePopup: AveProps | undefined,
  obsPopup: ObsProps | undefined,
  navigation: any
  setAvePopupHander: (prop: AveProps | undefined) => void,
  setObsPopupHandler: (prop: ObsProps | undefined) => void,
  onPopupCloseHandler: () => void,
}

export default function MapObservations({
  greyImage,
  camera,
  observations,
  avalanches,
  avePopup,
  obsPopup,
  navigation,
  setAvePopupHander,
  setObsPopupHandler,
  onPopupCloseHandler,
}: mapObsProps) {

  const aveIcon = require("../../assets/avalanche.png");
  const obsIcon = require("../../assets/danger.png");
  const [region, setRegion] = useState<string>("");

  /**
   * @param payload - Handle observation presses
   */
  function observationPress(press: OnPressEvent) {
    setAvePopupHander(undefined);
    let props = press.features[0].properties!["props"];
    let observation: ObsProps = {
      id: props["id"],
      position: props["position"],
      location: props["location"],
      date: props["date"],
      slope: props["slope"],
      aspect: props["aspect"],
      elevation: props["elevation"],
      red_flags: props["red_flags"],
    };

    // cool pan effect
    if (observation !== undefined) {
      let newCamera = [observation.position[0], observation.position[1]];
      camera.current?.setCamera({ centerCoordinate: newCamera, animationMode: "easeTo", pitch: 40 });
      setRegion(getRegionName({longitude: newCamera[0], latitude: newCamera[1]})!);
      setObsPopupHandler(observation);
    }
  }

  /**
   * @param payload - Handle avalanche presses
   */
  function avalanchePress(press: OnPressEvent) {
    setObsPopupHandler(undefined);
    let props = press.features[0].properties!["props"];
    let avalanche: AveProps = {
      id: props["id"],
      position: props["position"],
      location: props["location"],
      date: props["date"],
      depth: props["depth"],
      vertical: props["vertical"],
      width: props["width"],
      trigger: props["trigger"],
      comments: props["comments"],
    };

    if (avalanche !== undefined) {
      let newCamera = [avalanche.position[0], avalanche.position[1]];
      camera.current?.setCamera({ centerCoordinate: newCamera, animationMode: "easeTo", pitch: 40 });
      setRegion(getRegionName({longitude: newCamera[0], latitude: newCamera[1]})!);
      setAvePopupHander(avalanche);
    }
  }
  const hitbox = {
    width: greyImage ? 1 : 20,
    height: greyImage ? 1 : 20
  };

  const iconStyle = {
    obsIcon: {
      iconImage: "obsIcon",
      iconAllowOverlap: true,
      iconSize: 0.07,
      iconOpacity: greyImage ? 0.5 : 1,
    },
    aveIcon: {
      iconImage: "aveIcon",
      iconAllowOverlap: true,
      iconSize: 0.07,
      iconOpacity: greyImage ? 0.5 : 1,
    },
  };

  return (
    <Fragment>
      { // observation markers
        // make shapesource unclickable if greyImage
        observations.map((obs, index) => {
          return (
            <ShapeSource
              id={`obs${index}`}
              key={`obs${index}`}
              hitbox={hitbox}
              onPress={(e: OnPressEvent) => {
                if (!greyImage) observationPress(e);
              }}
              shape={{
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: obs.position,
                },
                properties: { props: obs },
              }}
            >
              <SymbolLayer id={`obsSymbol${index}`} minZoomLevel={1} style={iconStyle.obsIcon} />
              <Images images={{ obsIcon: obsIcon }} />
            </ShapeSource>
          );
        })}
      { // avalanche markers
        avalanches.map((ave, index) => {
          return (
            <ShapeSource
              id={`ave${index}`}
              key={`ave${index}`}
              hitbox={hitbox}
              onPress={(e: OnPressEvent) => {
                if (!greyImage) avalanchePress(e);
              }}
              shape={{
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: ave.position,
                },
                properties: { props: ave },
              }}
            >
              <SymbolLayer id={`aveSymbol${index}`} minZoomLevel={1} style={iconStyle.aveIcon} />
              <Images images={{ aveIcon: aveIcon }} />
            </ShapeSource>
          );
        })}
      { /* This shows an observation popup */
        obsPopup !== undefined &&
        <MapPopup
          type={popupType.observation}
          element={obsPopup}
          pressHandler={() => navigation.navigate("Observations",
            { id: obsPopup.id, region: region, observationsSelected: true })}
          onCloseHandler={onPopupCloseHandler}
        />}
      { /* This shows an avalanche popup */
        avePopup !== undefined &&
        <MapPopup
          type={popupType.avalanche}
          element={avePopup}
          pressHandler={() => navigation.navigate("Observations",
            { id: avePopup.id, region: region, observationsSelected: false })}
          onCloseHandler={onPopupCloseHandler}
        />}
    </Fragment>
  )
}

