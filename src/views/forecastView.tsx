import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View,SafeAreaView,Dimensions, ScrollView, Linking} from 'react-native'
import React, { useEffect, useState } from 'react'
import DangerRose from '../components/dangerRose'
import { readFromFileSystem ,filePaths} from '../generic_helpers/fileSystemHelpers'
import DropDownPicker from 'react-native-dropdown-picker';
import * as FileSystem from "expo-file-system"
import {decode} from 'html-entities';
import { color } from '../../assets/colors'

export default function ForecastView() {


  const [forecast, setForecast] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("salt-lake.json");
  const [items, setItems] = useState([
    {label: 'Logan', value: 'logan.json'},
    {label: 'Ogden', value: 'ogden.json'},
    {label: 'Salt Lake City', value: 'salt-lake.json'},
    {label: 'Provo', value: 'provo.json'},
    {label: 'Uintas', value: 'uintas.json'},
    {label: 'Skyline', value: 'skyline.json'},
    {label: 'Moab', value: 'moab.json'},
    {label: 'Abajos', value: 'abajos.json'}
  ]);
    useEffect(()=>{
      const getForecast = async() =>{
        let fc = await loadData(value)
        setForecast(fc);
      }
      getForecast();
    },[value])
  
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  // Titles and symbols for forecast sections
  const curr_conditions_title = decode("&#10052 WEATHER AND SNOW   \n")
  const recent_avys_title = decode("&#9968 RECENT AVALANCHES")
  const avyProb1Title = "Avalanche Problem 1: "+ decode(forecast.avalanche_problem_1)+ "\n"
  const avyProb2Title = "Avalanche Problem 2: "+ decode(forecast.avalanche_problem_2)+ "\n"
  const additional_info_title = decode("&#9968 ADDITIONAL INFORMATION \n")
  const linkString = "\n For images, videos and more information about todays avalanche forecast, check out the UAC's webiste "
  
  const dateIssuedText = "Issued on: " + decode(forecast.date_issued).trim()
  const overview = decode(forecast.bottom_line).trim()
  const currentConditions = decode(forecast.current_conditions).trim()
  let recentAvalanches = decode(forecast.recent_activity).trim()
  recentAvalanches= recentAvalanches.replaceAll("HERE","on the UAC's webiste")
  const avyProb1 = decode(forecast.avalanche_problem_1_description).trim()
  const avyProb2 = decode(forecast.avalanche_problem_2_description).trim()
  let additionalInformation = decode(forecast.mountain_weather).trim()
  additionalInformation= additionalInformation.replaceAll("HERE","on the UAC's webiste")

  type contentCardProps = {
    content_str: string
  }

  //conditional formatting for showing forecast elements that exist
  const AvyProb1Card = (props:contentCardProps) => {
    let output
    let contentExists = true

    //checks if the avalanche problem1 string only containes whitespace
    if (!props.content_str.replace(/\s/g, '').length) {
      contentExists=false;
    }
    if (contentExists) {
      output = 
      <Text style={styles.box}>
      <Text style ={styles.titleText}>
        {avyProb1Title}
      </Text>
      {avyProb1}
    </Text>
    } 
    else {
      output = <View></View>
    }
  
    return <View>{output}</View>
  }

  const AvyProb2Card = (props:contentCardProps) => {
    let output
    let contentExists = true

    //checks if the avalanche problem1 string only containes whitespace
    if (!props.content_str.replace(/\s/g, '').length) {
      contentExists=false;
    }
    if (contentExists) {
      output = 
      <Text style={styles.box}>
          <Text style ={styles.titleText}>
            {avyProb2Title}
          </Text>
          {avyProb2}
        </Text>
    } 
    else {
      output = <View></View>
    }
    return <View>{output}</View>
  }

  const AdditionalInfoCard = (props:contentCardProps) => {
    let output
    let contentExists = true

    //checks if the avalanche problem1 string only containes whitespace
    if (!props.content_str.replace(/\s/g, '').length) {
      contentExists=false;
    }
    if (contentExists) {
      output = 
      <Text style={styles.box}>
          <Text style ={styles.titleText}>
            {additional_info_title}
          </Text>
          {additionalInformation}
        </Text>
    } 
    else {
      output = <View></View>
    }
    return <View>{output}</View>
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Text >
          Select forecast Region
        </Text>
      <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
      />
      <ScrollView style={styles.container}>
        <Text>
          {dateIssuedText}
        </Text>
        <DangerRose dangerScore={forecast.overall_danger_rose}/>
        <View style ={styles.topBox}>
          <Text>
            {overview}
          </Text>
        </View>

        <View style={styles.element}>
        <Text style={styles.box}>
          <Text style ={styles.titleText}>
            {curr_conditions_title}
          </Text>
          {currentConditions}
        </Text>
        </View>
        
        <Text>
        </Text>

        <Text style={styles.box}>
          <Text style ={styles.titleText}>
            {recent_avys_title}
          </Text>
          {recentAvalanches}
        </Text>

        <Text>
        </Text>

        <AvyProb1Card content_str={avyProb1}/>

        <Text>
        </Text>

        <AvyProb2Card content_str={avyProb2}/>

        <Text>
        </Text>

        <AdditionalInfoCard content_str={additionalInformation} />

        <Text style={{fontSize:20,padding:10,}}>
          {linkString}
          <Text style={{color: 'blue',fontSize:20}}
          onPress={() => Linking.openURL('https://utahavalanchecenter.org/forecast')}>
             here
          </Text>
        </Text>

        <StatusBar style="auto" />
      </ScrollView>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 10,
  },
  topBox: {
    flex: 1,
    backgroundColor: color.ExtraLightGreen,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  element:{
    alignItems:"center",
    justifyContent: "center",
  },
  box: {
    flex: 1,
    backgroundColor: color.ExtraLightGreen,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText:{
    fontSize: 20,
    fontWeight:"bold",
    color: color.DarkGreen,
  }
});

async function loadData(region:any){
   let data = await readFromFileSystem(filePaths.UACForecast,region,FileSystem.EncodingType.UTF8);
   return JSON.parse(data)
}

