import { StyleSheet, Image, Text, TouchableOpacity, View, Button, Pressable } from 'react-native'
import React from 'react'
import BackButton from './backButton'
import { ObservationTileData } from './observationTile'
import { color } from '../../assets/colors'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { ScrollView } from 'react-native-gesture-handler'

type observationDetailProps = {
  pressHandler: () => void,
  backPressHandler: () => void,
  observationInfo: ObservationTileData
}

/**
 * @param Information for the observation and click handlers - observationDetailProps
 * @returns A detailed observation card
 */
export default function ObservationDetails({ pressHandler, backPressHandler, observationInfo }: observationDetailProps) {
  const textColor = color.Black

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>
          <FontAwesome name='binoculars' size={35} />
          {" " + observationInfo.title}
        </Text>
        
        <View style={[styles.componentView]}>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Observation Date"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{observationInfo.date}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Observer Name"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{observationInfo.observer}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Region"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{observationInfo.location}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Location Name or Route"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{observationInfo.route}</Text>
        </View>
        {observationInfo.sky !="N/A" || observationInfo.precipitation !="N/A" || observationInfo.wind_direction !="N/A"
          || observationInfo.wind_speed  !="N/A" || observationInfo.weather !="N/A"?(
          <View style={[styles.infoBox]}>
            <Text style={[styles.infoBoxTitle, { color: textColor }]}>{"Weather"}</Text>

            <Text style={[styles.infoBoxHeader, { color: textColor }]}>{"Sky"}</Text>
            <Text style={[styles.infoBoxText, { color: textColor }]}>{observationInfo.sky}</Text>
            <Text style={[styles.infoBoxHeader, { color: textColor }]}>{"Precipitation"}</Text>
            <Text style={[styles.infoBoxText, { color: textColor }]}>{observationInfo.precipitation}</Text>
            <Text style={[styles.infoBoxHeader, { color: textColor }]}>{"Wind Direction"}</Text>
            <Text style={[styles.infoBoxText, { color: textColor }]}>{observationInfo.wind_direction}</Text>
            <Text style={[styles.infoBoxHeader, { color: textColor }]}>{"Wind Speed"}</Text>
            <Text style={[styles.infoBoxText, { color: textColor }]}>{observationInfo.wind_speed}</Text>
            <Text style={[styles.infoBoxHeader, { color: textColor }]}>{"Weather Comments"}</Text>
            <Text style={[styles.infoBoxText, { color: textColor }]}>{observationInfo.weather}</Text>
          </View>
          ):(
            <View></View>
        )}
        <View><Text></Text></View> 
        {observationInfo.snow_characteristics !="N/A" ?(
          <View style={[styles.infoBox]}>
            <Text style={[styles.infoBoxTitle, { color: textColor }]}>{"Snow Characteristics"}</Text>

            <Text style={[styles.infoBoxText, { color: textColor }]}>{observationInfo.snow_characteristics}</Text>
          </View>
          ):(
            <View></View>
          )
        }
        <View><Text></Text></View>
        <View style={[styles.infoBox]}>
          <Text style={[styles.infoBoxTitle, { color: textColor }]}>{"Red Flags"}</Text>

          <Text style={[styles.infoBoxText, { color: textColor }]}>{observationInfo.flags}</Text>
        </View>
        <View><Text></Text></View>

        <View style={[styles.componentView]}>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Comments"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{observationInfo.comments}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Today's Observed Danger Rating"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{observationInfo.danger_rating}</Text>
          <Text style={[styles.componentHeader, { color: textColor }]}>{"Tomorrow's Estimated Danger Rating"}</Text>
          <Text style={[styles.componentText, { color: textColor }]}>{observationInfo.est_rating}</Text>
        </View>
        
        <View style={styles.buttonsContainer}>
          <BackButton label='delete' onPressHandler={backPressHandler} />
          <Pressable
            style={[styles.button, { backgroundColor: color.DarkBlue }]}
            onPress={pressHandler}
          >
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
