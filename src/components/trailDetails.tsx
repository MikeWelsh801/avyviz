import { StyleSheet, Image, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { color } from '../../assets/colors'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { getDangerInfo } from '../generic_helpers/trailHelpers'
import TrailStats from './trailStats'
import DeleteButton from './deleteButton'
import { TrailType } from '../generic_helpers/types'

type trailDetailProps = {
  pressHandler: () => void,
  backPressHandler: () => void,
  deletePressHandler: () => void,
  community: boolean,
  trailInfo: TrailType,
  maxDanger: number
}

/**
 * @param Information for the trail and click handlers - trailDetailProps
 * @returns A detailed trail card with danger advisories and stats.
 */
export default function TrailDetails({ pressHandler, backPressHandler, deletePressHandler, community, trailInfo, maxDanger }: trailDetailProps) {
  const dangerInfo = getDangerInfo(maxDanger);
  const textColor = dangerInfo.color == color.Black ? "white" : color.Black;
  const [dangerDetails, setDangerDetails] = useState(false);

  // really let em know if there's high danger
  let shortDescription = dangerInfo.shortDescription;
  if (shortDescription.toLowerCase().includes("high") ||
    shortDescription.toLowerCase().includes("extreme")) {
    shortDescription = shortDescription + " !!!"
  }

  /**
   * @param title - The trail title
   * @returns a formatted string
   */
  function formatTitle(title: string) {
    let padded = " " + title
    if (padded.length > 23)
      padded = padded.slice(0, 20) + "..."

    return padded;
  }

  /**
   * @param maxDanger - The danger score
   * @returns - the avalance icon associated with that level of danger.
   */
  const dangerIcon = (maxDanger: number) => {
    switch (maxDanger) {
      case 1:
      case 2: return require("../../assets/dangerIcons/Icon-Avalanche-Danger-Level-Dry-Snow-1-EAWS.png")
      case 3:
      case 4: return require("../../assets/dangerIcons/Icon-Avalanche-Danger-Level-Dry-Snow-2-EAWS.png")
      case 5:
      case 6: return require("../../assets/dangerIcons/Icon-Avalanche-Danger-Level-Dry-Snow-3-EAWS.png")
      case 7:
      case 8:
      case 9:
      case 10: return require("../../assets/dangerIcons/Icon-Avalanche-Danger-Level-Dry-Snow-4-5-EAWS.png")
      default: return require("../../assets/dangerIcons/Icon-Avalanche-Danger-Level-No-Rating-EAWS.png")
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={backPressHandler}>
        <FontAwesome name='close' size={30} style={{ alignSelf: "flex-end", margin: 5 }} />
      </TouchableOpacity>
      <Text style={styles.title}>
        <FontAwesome name='map-signs' size={28} />
        {formatTitle(trailInfo.trailName)}
      </Text>
      <TouchableOpacity onPress={() => setDangerDetails(!dangerDetails)} style={[styles.dangerView, { backgroundColor: dangerInfo.color }]}>
        <View style={styles.iconContainer}>
          <Image source={dangerIcon(maxDanger)} style={styles.icon} />
        </View>
        {dangerDetails &&
          // animate this view
          <View>
            <Text style={[styles.dangerTitle, { color: textColor, borderBottomColor: textColor }]}>{shortDescription}</Text>
            <Text style={[styles.dangerHeader, { color: textColor }]}>{"Travel Advice:"}</Text>
            <Text style={[styles.dangerText, { color: textColor }]}>{dangerInfo.travelAdvice}</Text>
            <Text style={[styles.dangerHeader, { color: textColor }]}>{"Likelihood:"}</Text>
            <Text style={[styles.dangerText, { color: textColor }]}>{dangerInfo.likeLihood}</Text>
            <Text style={[styles.dangerHeader, { color: textColor }]}>{"Size and Distribution:"}</Text>
            <Text style={[styles.dangerText, { color: textColor }]}>{dangerInfo.sizeAndDistribution}</Text>
          </View>
        }
      </TouchableOpacity>
      <TrailStats tile={trailInfo} />
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={pressHandler}>
          <FontAwesome name='map' size={30} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Add to Map</Text>
        </TouchableOpacity >
        {!community && <DeleteButton label='delete' onPressHandler={deletePressHandler} />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    alignSelf: "center",
    fontWeight: "bold",
    color: color.ExtraDarkGreen,
    borderBottomColor: color.ExtraDarkGreen,
    borderBottomWidth: 3,
  },
  iconContainer: {
    height: 70,
    maxWidth: 120,
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: "center",
    justifyContent: 'center'
  },
  icon: {
    width: '100%',
    height: '100%',
    flex: 0.8,
    resizeMode: "contain",
  },
  dangerView: {
    width: "auto",
    margin: 10,
    padding: 15,
    borderRadius: 15,
    opacity: 0.8,
    elevation: 3,
    shadowColor: color.Black,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
  },
  dangerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    borderBottomWidth: 1,
  },
  dangerHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 7,
  },
  dangerText: {
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "rgb(252, 253, 255)",
    borderRadius: 10,
    borderWidth: 0.7,
    // borderTopWidth: 8,
    // borderTopEndRadius: 6,
    borderColor: color.Blue,
    flexDirection: 'column',
    marginVertical: 10,
    marginHorizontal: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    // elevation: 10,
    // shadowColor: color.Black,
    // shadowRadius: 7,
    // shadowOpacity: 0.2,
    // shadowOffset: {
    //   width: -3,
    //   height: 3
    // },
    alignContent: "center",
    justifyContent: "flex-start"
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  buttonIcon: {
    fontSize: 25,
    color: 'white',
  },
  button: {
    flexDirection: "row",
    backgroundColor: color.Blue,
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 7,
    elevation: 3,
    shadowColor: color.Black,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 5,
  }
})
