import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { color } from '../../assets/colors';
import TrailStats from './trailStats';
import { TrailType } from '../generic_helpers/types';
let mapImage = require("../../assets/wasatch_mountains_map.jpg");

type TileProps = {
  trail: TrailType;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
};

/**
 * @param All of the data for a trail tile - title of trail, what to do if it's clicked, 
 * background color, text color, what to do if the delete button is clicked
 * @returns a Trail Tile component
 */
export default function TrailTile({ trail, onPress, backgroundColor, textColor }: TileProps) {

  /**
   * @param title - The title of the trail
   * @returns A formatted title that is shortened with ... if too it's too long
   */
  function formatTitle(title: string): string {
    let padded = " " + title
    if (padded.length > 30)
      padded = padded.slice(0, 25) + "..."

    return padded;
  }

  return (
    <TouchableOpacity onPress={onPress} style={[styles.tileContainer, { backgroundColor }]}>
      <Image source={mapImage} style={styles.map} />
      <View style={styles.titleContainer}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>
            <FontAwesome name='map-signs' size={17} />
            {formatTitle(trail.trailName)}
          </Text>
        </View>
      </View>
      <TrailStats tile={trail}/>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  tileContainer: {
    borderRadius: 6,
    borderWidth: 0.3,
    borderTopWidth: 8,
    borderTopEndRadius: 6,
    borderColor: color.Blue,
    flexDirection: 'column',
    marginVertical: 3,
    marginHorizontal: 16,
    paddingHorizontal: 0,
    paddingVertical: 5,
    elevation: 10,
    shadowColor: color.Black,
    shadowRadius: 7,
    shadowOpacity: 0.2,
    shadowOffset: {
      width: -3,
      height: 3
    }
  },
  titleContainer: {
    padding: 5,
    flexDirection: 'row',
    alignItems: "stretch",
    justifyContent: "space-between",
    alignSelf: "center",
    width: "100%",
    maxWidth: 310,
  },
  map: {
    padding: 5,
    width: 300,
    height: 150,
    borderRadius: 8,
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
})
