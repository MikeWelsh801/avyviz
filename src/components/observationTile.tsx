import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { color } from '../../assets/colors';

let mapImage = require("../../assets/wasatch_mountains_map.jpg");

export type ObservationTileData = {
  id: string;
  title: string;
  location: string;
  date: string;
  route: string;
  coordinates: string;
  flags: string;
  comments: string;
  observer: string;
  danger_rating: string;
  est_rating: string;
  sky: string;
  weather: string;
  snow_characteristics: string;
  wind_direction: string;
  wind_speed: string;
  precipitation: string;
  problem1: string;
  problem2: string;
  trend: string;
};

type TileProps = {
  tile: ObservationTileData;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
};

/**
 * @param All of the data for a Observation tile - title of Observation, what to do if it's clicked, 
 * background color, text color, what to do if the delete button is clicked
 * @returns a Observation Tile component
 */
export default function ObservationTile({ tile, onPress, backgroundColor, textColor, }: TileProps) {

  /**
   * @param title - The title of the Observation
   * @returns A formatted title that is shortened with ... if too it's too long
   */
  function formatTitle(title: string): string {
    let padded = " " + title
    if (padded.length > 22)
      padded = padded.slice(0, 20) + "..."

    return padded;
  }

  return (
    <TouchableOpacity onPress={onPress} style={[styles.tileContainer, { backgroundColor }]}>
      <View style={styles.iconStyle}>
        <FontAwesome name='binoculars' size={55} />
      </View>
      <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: textColor }]}>
            {formatTitle(tile.title)}
          </Text> 
      </View>
      <View>
            <Text style={[styles.statLine]}>
                {tile.date}
            </Text>
        </View>
      
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
  statLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: 37,
    marginLeft: 37,
  },
  iconStyle:{
    flex: 1,
    alignItems:"center"
  }
})
