import { StyleSheet, Image, Text, TouchableOpacity, View, ScrollView, Pressable } from 'react-native'
import React from 'react'
import BackButton from './backButton'
import { AvalancheTileData } from './avalancheTile'
import { color } from '../../assets/colors'
import FontAwesome from '@expo/vector-icons/FontAwesome'

type avalancheDetailProps = {
  pressHandler: () => void,
  backPressHandler: () => void,
  avalancheInfo: AvalancheTileData
}

/**
 * @param Information for the observation and click handlers - observationDetailProps
 * @returns A detailed observation card
 */
export default function AvalancheDetails({ pressHandler, backPressHandler, avalancheInfo }: avalancheDetailProps) {
  const textColor = color.Black

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>
          <FontAwesome name='snowflake-o' size={35} />
          {" " + avalancheInfo.title}
        </Text>
        <View style={[styles.componentView]}>
        
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Observation Date"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{avalancheInfo.date}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Observer Name"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{avalancheInfo.observer}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Region"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{avalancheInfo.location}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Location Name or Route"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{avalancheInfo.route}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Elevation"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{avalancheInfo.elevation}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Aspect"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{avalancheInfo.aspect}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Slope Angle"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{avalancheInfo.angle}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Trigger"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{avalancheInfo.trigger}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Avalanche Type"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{avalancheInfo.type}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Avalanche Problem"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{avalancheInfo.problem}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Weak Layer"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{avalancheInfo.weakLayer}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Depth"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{avalancheInfo.depth}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Width"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{avalancheInfo.width}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Vertical"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{avalancheInfo.vertical}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Comments"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{avalancheInfo.comments}</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <BackButton label='delete' onPressHandler={backPressHandler} />
          <Pressable
            style={[styles.button, { backgroundColor: color.DarkBlue }]}
            onPress={pressHandler}>
            <FontAwesome
              name="forward"
              size={25}
              color={"white"}
              style={styles.buttonIcon}
            />
            <FontAwesome
              name="map"
              size={25}
              color={"white"}
              style={styles.buttonIcon}
            />
          </Pressable>
        </View> 
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 35,
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
  componentView: {
    margin: 10,
    padding: 15,
    borderRadius: 15,
    minWidth: 300,
    opacity: 0.8,
  },
  componentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    borderBottomWidth: 1,
  },
  componentHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 7,
  },
  componentText: {
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 0.3,
    borderTopWidth: 8,
    borderTopEndRadius: 6,
    borderColor: color.Blue,
    flexDirection: 'column',
    marginVertical: 10,
    marginHorizontal: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    elevation: 10,
    shadowColor: color.Black,
    shadowRadius: 7,
    shadowOpacity: 0.2,
    shadowOffset: {
      width: -3,
      height: 3
    },
    alignContent: "center",
    justifyContent: "center"
  },
  buttonsContainer: {
    flex: 0.95,
    marginLeft:45,
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "flex-start"
  },
  button: {
    borderRadius: 8,
    borderWidth: 0.6,
    flexDirection: "row",
    borderColor: color.ExtraLightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonIcon: {
    padding: 5,
    paddingHorizontal: 15,
  },
  infoBox:{
    flex: 1,
    borderColor:"black",
    borderWidth: 1,
  },
  infoBoxTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 7,
  },
  infoBoxHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 7,
    marginLeft:7,
  },
  infoBoxText: {
    fontSize: 16,
    marginLeft:7,
  },
  scrollView: {
    flex: 1,
    marginHorizontal: 10,
  },
})
