import { BackHandler, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import ObservationTile, { ObservationTileData } from '../components/observationTile';
import AvalancheTile, { AvalancheTileData } from '../components/avalancheTile';
import { color } from '../../assets/colors';
import DropDownPicker from 'react-native-dropdown-picker';
import ObservationDetails from '../components/observationDetails';
import AvalancheDetails from '../components/avalancheDetails';
import { filePaths, readAllFiles, readFromFileSystem } from '../generic_helpers/fileSystemHelpers';
import { EncodingType } from 'expo-file-system';
import { decode } from 'html-entities';
import ButtonSwitch from 'rn-switch-button';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

/*
 * This is just a dummy screen that we can use
 * to test out navigation. We can change it later
 * to have an actual observation list.
 */
export default function ObservationListView({ route, navigation }: any) {
  /* Trails info */
  // This works now... I hope this is the correct way to do this.
  // const trails: TrailType[] = useSelector((state: any) => state.globalTrailsState.trails);
  const [selectedId, setSelectedId] = useState<string>("none");
  const [observationData, setObservationData] = useState<ObservationTileData[]>([]);
  const [avalancheData, setAvalancheData] = useState<AvalancheTileData[]>([]);

  /* Info about the view */
  const [observationsSelected, setObservationsSelected] = useState(true);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("salt-lake");
  const isFocused = useIsFocused();
  const [items, setItems] = useState([
    { label: 'Logan', value: 'logan' },
    { label: 'Ogden', value: 'ogden' },
    { label: 'Salt Lake City', value: 'salt-lake' },
    { label: 'Provo', value: 'provo' },
    { label: 'Uintas', value: 'uintas' },
    { label: 'Skyline', value: 'skyline' },
    { label: 'Moab', value: 'moab' },
    { label: 'Abajos', value: 'abajos' }
  ]);

  // sets up the trail list on mount and refresh when opened
  useEffect(() => {
    (async () => {
      let regions = await readAllFiles(filePaths.Overlays);
      let regionList = [];
      for(let i=0;i<regions.length;i++){
        if(regions[i]=="salt-lake"){
          regionList.push({label:"Salt Lake City",value:regions[i]})
        }
        else if(regions[i]=="logan"){
          regionList.push({label:"Logan",value:regions[i]})
        }
        else if(regions[i]=="ogden"){
          regionList.push({label:"Ogden",value:regions[i]})
        }
        else if(regions[i]=="moab"){
          regionList.push({label:"Moab",value:regions[i]})
        }
        else if(regions[i]=="uintas"){
          regionList.push({label:"Uintas",value:regions[i]})
        }
        else if(regions[i]=="abajos"){
          regionList.push({label:"Abajos",value:regions[i]})
        }
        else if(regions[i]=="skyline"){
          regionList.push({label:"Skyline",value:regions[i]})
        }
        else if(regions[i]=="provo"){
          regionList.push({label:"Provo",value:regions[i]})
        }
          
      }
      setItems(regionList);

      let avalancheFiles = await readAllFiles(filePaths.UACAvalanches);
      let avalancheIds = [];
      let avalancheData = [];
      for (let i = 0; i < avalancheFiles.length; i++) {
        const file = avalancheFiles[i];
        if (file.includes(value)) {
          const id = file.split('_')[0];
          avalancheIds.push(id);
          const data = await readFromFileSystem(filePaths.UACAvalanches, file, EncodingType.UTF8);
          avalancheData.push(data);
        }
      }

      let observationFiles = await readAllFiles(filePaths.UACObservations);
      let observationData = [];
      let observationIds = [];

      for (let i = 0; i < observationFiles.length; i++) {
        const file = observationFiles[i];
        if (file.includes(value)) {
          const id = file.split('_')[0];
          observationIds.push(id);
          const data = await readFromFileSystem(filePaths.UACObservations, file, EncodingType.UTF8);
          observationData.push(data);
        }
      }

      let avalanches = [];
      for (let i = 0; i < avalancheData.length; i++) {
        const element = JSON.parse(avalancheData[i]);
        let rt = "N/A";
        if(element["Location Name or Route"]){
          rt = decode(element["Location Name or Route"]);
        }
        let region = "N/A";
        if(element["Region"]){
          region = decode(element["Region"]);
        }
        let asp = "N/A";
        if(element["Aspect"]){
          asp = decode(element["Aspect"]);
        }
        let avyDate = "N/A";
        if(element["Avalanche Date"]){
          avyDate = decode(element["Avalanche Date"]);
        }
        let prob = "N/A";
        if(element["Avalanche Problem"]){
          prob = decode(element["Avalanche Problem"]);
        }
        let avyType = "N/A";
        if(element["Avalanche Type"]){
          avyType = decode(element["Avalanche Type"]);
        }
        let comms = "N/A";
        if(element["Comments"]){
          comms = decode(element["Comments"]);
        }
        let coords = "N/A";
        if(element["Coordinates"]){
          coords = decode(element["Coordinates"]);
        }
        let avyDepth = "N/A";
        if(element["Depth"]){
          avyDepth = decode(element["Depth"]);
        }
        let elev = "N/A";
        if(element["Region"]){
          elev = decode(element["Elevation"]);
        }
        let observerName = "N/A";
        if(element["Observer Name"]){
          observerName = decode(element["Observer Name"]);
        }
        let ang = "N/A";
        if(element["Slope Angle"]){
          ang = decode(element["Slope Angle"]);
        }
        let trig = "N/A";
        if(element["Trigger"]){
          trig = decode(element["Trigger"]);
        }
        let trigInfo = "N/A";
        if(element["Trigger: additional info"]){
          trigInfo = decode(element["Trigger: additional info"]);
        }
        let vert = "N/A";
        if(element["Vertical"]){
          vert = decode(element["Vertical"]);
        }
        let weakL = "N/A";
        if(element["Weak Layer"]){
          weakL = decode(element["Weak Layer"]);
        }
        let wid = "N/A";
        if(element["Width"]){
          wid = decode(element["Width"]);
        }
        avalanches.push({
          id: avalancheIds[i],
          title: rt,
          location: region,
          aspect: asp,
          date: avyDate,
          problem: prob,
          type: avyType,
          comments: comms,
          coordinates: coords,
          depth: avyDepth,
          elevation: elev,
          route: rt,
          observer: observerName,
          angle: ang,
          trigger: trig,
          triggerInfo: trigInfo,
          vertical: vert,
          weakLayer: weakL,
          width: wid,
        })
      }

      let observations = [];
      for (let i = 0; i < observationData.length; i++) {
        const element = JSON.parse(observationData[i]);
        let route = "N/A";
        if(element["Location Name or Route"]){
          route = decode(element["Location Name or Route"]);
        }
        let loc = "N/A";
        if(element["Region"]){
          loc = decode(element["Region"]);
        }
        let obsDate = "N/A";
        if(element["Observation Date"]){
          obsDate = decode(element["Observation Date"]);
        }
        let coords = "N/A";
        if(element["Coordinates"]){
          coords = decode(element["Coordinates"]);
        }
        let redFlags = "N/A";
        if(element["Red Flags"]){
          redFlags = decode(element["Red Flags"]);
        }
        let comms = "N/A";
        if(element["Comments"]){
          comms = decode(element["Comments"]);
        }
        let observerName = "N/A";
        if(element["Observer Name"]){
          observerName = decode(element["Observer Name"]);
        }
        let danger = "N/A";
        if(element["Today's Observed Danger Rating"]){
          danger = decode(element["Today's Observed Danger Rating"]);
        }
        let tomorrowDanger = "N/A";
        if(element["Tomorrows Estimated Danger Rating"]){
          tomorrowDanger = decode(element["Tomorrows Estimated Danger Rating"]);
        }
        let skyData = "N/A";
        if(element["Sky"]){
          skyData = decode(element["Sky"]);
        }
        let weatherComments = "N/A";
        if(element["Weather Comments"]){
          weatherComments = decode(element["Weather Comments"]);
        }
        let snowCharacteristics = "N/A";
        if(element["Snow Characteristics"]){
          snowCharacteristics = decode(element["Snow Characteristics"]);
        }
        let windDirection = "N/A";
        if(element["Wind Direction"]){
          windDirection = decode(element["Wind Direction"]);
        }
        let windSpeed = "N/A";
        if(element["Wind Speed"]){
          windSpeed = decode(element["Wind Speed"]);
        }
        let precip = "N/A";
        if(element["Precipitation"]){
          precip = decode(element["Precipitation"]);
        }
        let prob1 = "N/A";
        if(element["Problem #1 Comments"]){
          prob1 = decode(element["Problem #1 Comments"]);
        }
        let prob2 = "N/A";
        if(element["Problem #2 Comments"]){
          prob2 = decode(element["Problem #2 Comments"]);
        }
        let trnd = "N/A";
        if(element["Trend"]){
          trnd = decode(element["Trend"]);
        }
        observations.push({
          id: observationIds[i],
          title: route,
          location: loc,
          date: obsDate,
          route: route,
          coordinates: coords,
          flags: redFlags,
          comments: comms,
          observer: observerName,
          danger_rating: danger,
          est_rating: tomorrowDanger,
          sky: skyData,
          weather: weatherComments,
          snow_characteristics: snowCharacteristics,
          wind_direction: windDirection,
          wind_speed: windSpeed,
          precipitation: precip,
          problem1: prob1,
          problem2: prob2,
          trend: trnd

        })
      }
      //TODO: If the user hasn't downloaded the maps for a specific region, they will not
      // see any observations when they click on that region. Let the user know this somehow
      setAvalancheData(avalanches);
      setObservationData(observations);

    })();
  }, [value]);

  // this is just to set the selected from routing. Don't want to run all the other
  // stuff on focus
  useEffect(() => {
    if (route.params === undefined) {
      setSelectedId("none");
    } else {
      setObservationsSelected(route.params["observationsSelected"]);
      setSelectedId(`${route.params["id"]}`);
      setValue(route.params["region"]);
    }
  }, [isFocused])

  // set up back press from details view
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (selectedId == "none") {
          return false;
        } else {
          setSelectedId("none");
          return true;
        }
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [selectedId])
  );

  /**
  * @param id - the id of an observation
  * @returns the observation data for that id
  */
  const getSelectedObservation = (id: string): ObservationTileData | undefined => {
    return observationData.find((obs) => obs.id == id);
  }

  /**
   * @param id - the id of an observation
   * @returns the observation data for that id
   */
  const getSelectedAvalanche = (id: string): AvalancheTileData | undefined => {
    return avalancheData.find((avy) => avy.id == id);
  }

  /**
   * @returns Returns the object of the of the selectedId or nothing
   */
  function renderSelected() {
    let ave = getSelectedAvalanche(selectedId);
    if (ave !== undefined) {
      return <AvalancheDetails
        avalancheInfo={ave}
        backPressHandler={() => setSelectedId("none")}
        pressHandler={() => navigation.navigate("Map", { id: selectedId, type: "avalanche" })} />;
    }

    let obs = getSelectedObservation(selectedId);
    if (obs !== undefined) {
      return <ObservationDetails
        observationInfo={obs}
        backPressHandler={() => setSelectedId("none")}
        pressHandler={() => navigation.navigate("Map", { id: selectedId, type: "observation" })} />;
    }

    return <></>;
  }

  /**
  * @param item The avalanche Tile To render - contains all of an avalanche's data
  * @returns A rendered avalanche
  */
  const renderAvalanche = ({ item }: { item: AvalancheTileData }) => {
    const backgroundColor = item.id === selectedId ? color.ExtraLightGreen : "white";
    const idColor = item.id === selectedId ? color.ExtraLightBlue : color.ExtraDarkGreen;

    return (
      <AvalancheTile
        tile={item}
        onPress={() => setSelectedId(item.id)}
        backgroundColor={backgroundColor}
        textColor={idColor}
      />
    );
  };

  /**
   * @param item The observation Tile To render - contains all of an observation's data
   * @returns A rendered observation
   */
  const renderObservation = ({ item }: { item: ObservationTileData }) => {
    const backgroundColor = item.id === selectedId ? color.ExtraLightGreen : "white";
    const idColor = item.id === selectedId ? color.ExtraLightBlue : color.ExtraDarkGreen;

    return (
      <ObservationTile
        tile={item}
        onPress={() => setSelectedId(item.id)}
        backgroundColor={backgroundColor}
        textColor={idColor}
      />
    );
  };

  return (
    <View style={styles.container}>
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
      {selectedId == "none" ? (
        <SafeAreaView style={styles.container}>
          <View style={styles.headerContainer}>
            <ButtonSwitch
              deafultSelectedIndex={observationsSelected ? 0 : 1}
              activeButtonStyle={styles.button}
              onClickLeft={() => setObservationsSelected(true)}
              onClickRight={() => setObservationsSelected(false)}
              leftText="Observations"
              rightText="Avalanches" />
          </View>
          {observationsSelected?(
            <FlatList
            data={observationData}
            renderItem={renderObservation}
            keyExtractor={item => item.id}
            extraData={selectedId}
            style={styles.listContainer}
          />
          ):(
            <FlatList
              data={avalancheData}
              renderItem={renderAvalanche}
              keyExtractor={item => item.id}
              extraData={selectedId}
              style={styles.listContainer}
            />
          )}
            
        </SafeAreaView>
      ) : (
        <View style={styles.container}>
          {renderSelected()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 0.85,
  },
  headerContainer: {
    flex: 0.15,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'center',
    borderBlockColor: color.ExtraDarkBlue,
    borderBottomWidth: 1.5,
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: color.DarkBlue,
  }
})
