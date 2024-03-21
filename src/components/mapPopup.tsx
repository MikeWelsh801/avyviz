import { StyleSheet, Text, View } from 'react-native'
import React, { Fragment, useEffect, useState } from 'react'
import { MarkerView } from '@rnmapbox/maps'
import { Position } from '@rnmapbox/maps/lib/typescript/types/Position'
import { color } from '../../assets/colors'
import { getDangerInfo, getDangerRating } from '../generic_helpers/trailHelpers'
import { TouchableOpacity } from 'react-native'
import FontAwesome from "@expo/vector-icons/FontAwesome"

type PopupProps = {
  type: popupType,
  element: AveProps | ObsProps
  pressHandler: () => void,
  onCloseHandler: () => void
}

/**
 * Type of the popup.
 */
export enum popupType {
  observation = "Observation",
  avalanche = "Avalanche"
}

// we'll have different fields to read depending on type
export type AveProps = {
  id: Number,
  position: Position,
  location: String,
  date: String,
  depth: String,
  vertical: String,
  width: String,
  trigger: String,
  comments: String,
}

/**
 * All of the things we might care about for an observation.
 */
export type ObsProps = {
  id: Number,
  position: Position,
  location: String,
  date: String,
  slope: String,
  aspect: String,
  elevation: String,
  red_flags: String,
}

/**
 * @param type ("avalanche", "observation"), element: obervation information
 * @returns a map popup with brief/relavant information about the observation.
 */
export default function MapPopup({ type, element, pressHandler, onCloseHandler }: PopupProps) {
  const [stats, setStats] = useState<String>("");
  const [dangerBg, setDangerBg] = useState<string>("");

  useEffect(() => {
    setDangerBg("");
    const setUp = async () => {
      let stats = getStatString(element);
      let danger = await getDangerRating({
        longitude: element.position[0],
        latitude: element.position[1]
      });
      let bgColor = getDangerInfo(danger).color;
      setDangerBg(bgColor);
      setStats(stats);
    }
    setUp();
  }, [element]);

  /**
   * @param element - Either an observation or avalanche property
   * @returns an appropriately formated string with stats
   */
  function getStatString(element: ObsProps | AveProps): String {
    if (type == popupType.observation) {
      let slope = (element as ObsProps).slope;
      let aspect = (element as ObsProps).aspect;
      let elevation = (element as ObsProps).elevation;
      return `Slope: ${slope || "N/A"}, Aspect: ${aspect || "N/A"}, Elevation: ${elevation || "N/A"}`
    }
    let depth = (element as AveProps).depth;
    let width = (element as AveProps).width;
    let vertical = (element as AveProps).vertical;
    return `Depth: ${depth || "N/A"}, Width: ${width || "N/A"}, Vertical: ${vertical || "N/A"}`;
  }

  /**
   * @param comments - The comments in an observation property
   * @returns If the comments are too long it cuts it short with elipses
   */
  function formatComments(comments: String) {
    if (comments.length > 150) {
      return comments.slice(0, 150) + " ...";
    }
    return comments;
  }

  return (
    <MarkerView
      id="symbolAvePopupSource"
      key="avePopup"
      coordinate={element.position}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      {dangerBg != "" ?
        <View style={[styles.popUpContainer, { backgroundColor: dangerBg }]}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>{type}</Text>
            <TouchableOpacity onPressIn={onCloseHandler}>
              <FontAwesome name='close' size={25} />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 14 }}>{`Coordinates: ${element.position[0].toFixed(5)},  ${element.position[1].toFixed(5)}`}</Text>
          <Text style={{ fontSize: 14 }}>{`Location: ${(element as ObsProps).location}`}</Text>
          <Text style={{ fontSize: 14 }}>{`Reported on: ${(element as ObsProps).date}`}</Text>
          <Text style={{ fontSize: 14 }}>{stats}</Text>
          {type == popupType.observation &&
            <Fragment>
              <Text style={{ fontSize: 14, fontWeight: "600" }}>{`\nRed Flags:`}</Text>
              <Text style={{ fontSize: 14 }}>{`${formatComments((element as ObsProps).red_flags)}`}</Text>
            </Fragment>
          }
          {type == popupType.avalanche &&
            <Fragment>
              <Text style={{ fontSize: 14 }}>{`Trigger: ${(element as AveProps).trigger || "Unknown"}`}</Text>
              <Text style={{ fontSize: 14, fontWeight: "600" }}>{`\nComments:`}</Text>
              <Text style={{ fontSize: 14 }}>{formatComments((element as AveProps).comments)}</Text>
            </Fragment>
          }
          <TouchableOpacity onPressIn={pressHandler} style={styles.details}>
            <Text style={{ fontSize: 17, alignSelf: "flex-end", fontWeight: "600", color: color.DarkBlue }}>
              {`\nClick for details`}

            </Text>
          </TouchableOpacity>
        </View>
        : <Fragment></Fragment>
      }
    </MarkerView>
  )
}

const styles = StyleSheet.create({
  details: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 5,
  },
  popUpContainer: {
    width: 'auto',
    height: 'auto',
    maxWidth: 350,
    borderColor: color.Blue,
    borderWidth: 0.5,
    borderTopWidth: 6,
    borderTopEndRadius: 6,
    borderTopStartRadius: 6,
    borderRadius: 12,
    opacity: 0.9,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "500",
    color: color.ExtraDarkBlue,
    borderBottomWidth: 0.8,
    marginBottom: 3,
  }
})
