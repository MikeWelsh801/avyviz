import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { color } from '../../assets/colors'
import { convertAspect, metersToFeet } from '../generic_helpers/trailHelpers';
import { TrailType, distance } from '../generic_helpers/types';

type StatsProps = {
  tile: TrailType,
}

export default function TrailStats({ tile }: StatsProps) {

  /**
   * @param dist - km and miles
   * @returns A nicely formatted string with rounded data
   */
  function formatDistance(dist: distance): string {
    let miles = (Math.round(dist.miles * 10) / 10).toFixed(1);
    let km = (Math.round(dist.km * 10) / 10).toFixed(1);
    return miles + " miles, " + km + " km";
  }

  /**
   * @param slope - a slope in degrees
   * @returns a formatted string for the slope that checks for dummy values
   */
  function formatSlope(slope: number): string {
    return slope == -9999 ? "N/A" : `${slope.toFixed(0)}\xB0`;
  }

  /**
   * @param aspect - an aspect in degrees from north
   * @returns a converted string (e.g. North East)
   */
  function formatAspect(aspect: number): string {
    return aspect == -9999 ? "N/A" : `${convertAspect(aspect)[0]}`;
  }

  return (
    <View>
      <Text style={styles.statTitle}>Trail Stats</Text>
      <View style={styles.statLine}>
        <Text style={styles.header}>Total Distance:</Text>
        <Text style={styles.distance}>
          {formatDistance(tile.totalDistance)}
        </Text>
      </View>
      <View style={styles.statLine}>
        <Text style={styles.header}>Elevation gain:</Text>
        <Text style={styles.distance}>
          {`${metersToFeet(tile.elevationGain).toFixed(0)}'`}
        </Text>
      </View>
      <View style={styles.statLine}>
        <Text style={styles.header}>Elevation loss:</Text>
        <Text style={styles.distance}>
          {`${metersToFeet(tile.elevationLoss).toFixed(0)}'`}
        </Text>
      </View>
      <View style={styles.statLine}>
        <Text style={styles.header}>Avg. Slope Aspect:</Text>
        <Text style={styles.distance}>
          {formatAspect(tile.averageAspect)}
        </Text>
      </View>
      <View style={styles.statLine}>
        <Text style={styles.header}>Avg. Slope Angle:</Text>
        <Text style={styles.distance}>
          {formatSlope(tile.averageSlope)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  distance: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 23,
  },
  header: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 23,
  },
  statLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: 37,
    marginLeft: 37,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: "400",
    color: color.ExtraDarkBlue,
    marginLeft: 30,
    marginRight: 30,
    borderBottomWidth: 1.5,
    borderBottomColor: color.ExtraDarkBlue,
  },
})
