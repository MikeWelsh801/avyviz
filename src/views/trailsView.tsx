import { Alert, Text, FlatList, SafeAreaView, StyleSheet, TextInput, View, BackHandler, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { deleteFileOrDirectory, filePaths, readAllFiles, readFromFileSystem } from '../generic_helpers/fileSystemHelpers';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { color } from '../../assets/colors'
import TrailTile from '../components/trailTile';
import ButtonSwitch from 'rn-switch-button'
import TrailDetails from '../components/trailDetails';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { TrailOriginType, TrailType } from '../generic_helpers/types';
import { EncodingType } from 'expo-file-system';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from "../../Firebase"
import { removeTrailFromTrails, setCurrentTrail } from '../trailState';
import { LatLng } from 'react-native-maps';
import BottomSheet, { TouchableOpacity } from '@gorhom/bottom-sheet';
import { ScrollView } from 'react-native-gesture-handler';
import { getMaxDanger } from '../generic_helpers/trailHelpers';
import FontAwesome from "@expo/vector-icons/FontAwesome"


export default function TrailsView({ route, navigation }: any) {
  /* Trails info */
  type TrailMap = { [id: number]: TrailType }
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [selectedDanger, setSelectedDanger] = useState<number>(0);
  const [userData, setUserData] = useState<TrailMap>({});
  const [communityData, setCommunityData] = useState<TrailMap>({});
  const [filteredData, setFilteredData] = useState<TrailType[]>([]);
  const bottomSheetRef = useRef<BottomSheet>(null);

  /* Info about the view */
  const isFocused = useIsFocused()
  const [userTrailsSelected, setUserTrailsSelected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [commLoading, setCommLoading] = useState(true);
  const dispatch = useDispatch();
  const currentTrail: TrailType = useSelector((state: any) => state.globalTrailsState.currentTrail, shallowEqual);

  /* Search bar */
  const [text, onChangeText] = useState('');

  // sets up the trail list on mount and refresh when opened
  useEffect(() => {
    (async () => {

      let trailFiles = await readAllFiles(filePaths.Trails);
      let userTrails: TrailMap = {}
      let communityTrails: TrailMap = {};

      for (const file of trailFiles) {
        const data = await readFromFileSystem(filePaths.Trails, file, EncodingType.UTF8);
        const trail = JSON.parse(data);
        // create all the trail data and add to the correct list (user or community)
        if (trail.type == TrailOriginType.user) {
          userTrails[trail.uid] = trail;
        } else {
          communityTrails[trail.uid] = trail;
        }
      }

      setUserData(userTrails);
      setLoading(false);
      if (commLoading) {
        await loadCommunityTrails(communityTrails);
        setCommunityData(communityTrails);
      }
      setCommLoading(false);
      userTrailsSelected ? setFilteredData(Object.values(userTrails)) : setFilteredData(Object.values(communityTrails));
    })();
  }, [isFocused]);

  // this is all we want to do on focus not all of the async load stuff
  useEffect(() => {
    if (route.params === undefined) {
      setSelectedId(undefined);
    } else {
      // if it's not in the trails lists wait to load
      if (!userData[route.params.trail] && !communityData[route.params.trail]) {
        setLoading(true);
        setCommLoading(true);
      }
      setUserTrailsSelected(route.params.trailType == TrailOriginType.user);
      setSelectedId(route.params.trail);
    }
    route.params = undefined;
  }, [isFocused]);

  // used to reset the danger if a trail is selected
  useEffect(() => {
    const setDanger = async () => {
      if (selectedId === undefined) {
        return;
      }
      let trail = getSelectedItem(selectedId);
      if (trail === undefined) {
        return;
      }
      const danger = await getMaxDanger(trail.trailPoints);
      setSelectedDanger(danger);
    };
    setDanger();
  }, [selectedId, loading, commLoading]);

  useEffect(() => {
    onChangeText("");
    searchFilter("");
  }, [userTrailsSelected, isFocused]);

  useEffect(() => {
    searchFilter(text);
  }, [text]);

  /** This mumbo jumbo is a crazy react-native way of preventing going back to 
   *  the map when you click the back button from a trail detail card. */
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (selectedId == undefined) {
          return false;
        } else {
          setSelectedId(undefined);
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
   * @returns Loads in Community Trails from Firestore and returns an array
   * of trail data
   */
  async function loadCommunityTrails(communityTrails: TrailMap) {
    let communityRef = collection(db, `Trails`);
    let communityQuery = query(communityRef);
    let communitySnapshot = await getDocs(communityQuery);

    for (let i = 0; i < communitySnapshot.docs.length; i++) {
      const data = communitySnapshot.docs[i].data();
      const id = +communitySnapshot.docs[i].id;
      communityTrails[id] = {
        uid: id, trailName: data["trailName"],
        trailPoints: data["trailPoints"].map((point: LatLng) => [point.longitude, point.latitude]),
        trailDescription: data["trailDescription"],
        type: data["type_"],
        editing: data["editing"],
        editable: data["editable"],
        region: data["region"],
        state: data["state"],
        totalDistance: data["totalDistance"],
        elevationGain: data["elevationGain"],
        elevationLoss: data["elevationLoss"],
        averageSlope: data["averageSlope"],
        averageAspect: data["averageAspect"]
      };
    }
  }

  /**
   * This function deletes a trail from the trails list.
   *
   * @param trailId - The name of the trail to be deleted
   */
  function deleteTrail(trailId: number): void {
    Alert.alert("Delete Trail", "Are you sure?", [
      {
        text: "Cancel",
        onPress: () => { },
        style: "cancel"
      },
      {
        text: "Ok",
        onPress: () => {
          setSelectedId(undefined);
          deleteFileOrDirectory(filePaths.Trails, trailId.toString())
          dispatch(removeTrailFromTrails(getSelectedItem(trailId)));
          if (currentTrail !== undefined && currentTrail.uid == selectedId) {
            dispatch(setCurrentTrail(undefined));
          }
          if (userTrailsSelected) {
            delete userData[trailId];
            setUserData(userData);
            setFilteredData(Object.values(userData));
          } else {
            delete communityData[trailId];
            setCommunityData(communityData);
            setFilteredData(Object.values(communityData));
          }
          setSelectedId(undefined);
          setSelectedDanger(0);
          bottomSheetRef.current?.collapse();
        }
      }
    ])
  }

  /**
   * @param id - the id of a trail
   * @returns the trail data for that id
   */
  const getSelectedItem = (id: number): TrailType => {
    return userData[id] ?? communityData[id];
  }

  /**
   * @param text - Sets the filtered trails to the trails that contain the text
   */
  const searchFilter = (text: string) => {
    const newData = userTrailsSelected ? userData : communityData;
    if (text === "") {
      setFilteredData(Object.values(newData));
      return 0;
    }

    const filteredData = Object.values(newData).filter((item) => {
      const itemData = item.trailName.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    setFilteredData(filteredData);
  }

  /**
   * @param The trail Tile To render - contains all of a trail's data
   * @returns A rendered trail handles coloring selected trails
   */
  const renderItem = ({ item }: { item: TrailType }) => {
    const backgroundColor = "white";
    const idColor = item.uid === selectedId ? color.DarkGreen : color.ExtraDarkGreen;

    return (
      <TrailTile trail={item}
        onPress={() => {
          setSelectedId(item.uid);
          bottomSheetRef.current?.expand();
        }}
        backgroundColor={backgroundColor}
        textColor={idColor}
      />
    );
  };

  const renderSearch = () => {
    return (
      <View style={styles.searchBar}>
        <TextInput
          placeholder={userTrailsSelected ? "Search my trails..." : "Search community trails..."}
          placeholderTextColor={color.DarkGreen}
          autoCorrect={false}
          onChangeText={(text) => onChangeText(text)}
          value={text}
          clearTextOnFocus={true}
          onFocus={() => onChangeText("")}
        />
        <TouchableOpacity style={styles.clearSearchButton} onPress={() => onChangeText("")}>
          <Text style={{ fontSize: 16, fontWeight: "500", color: color.LightBG }}>{"clear  "}</Text>
          <FontAwesome name="close" size={15} color={color.LightBG} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <ButtonSwitch
            innerViewStyle={styles.buttonContainer}
            outerViewStyle={{ paddingHorizontal: 12 }}
            textSelectedStyle={{ fontSize: 16, fontWeight: "500" }}
            textUnSelectedStyle={{ fontSize: 16, fontWeight: "400" }}
            deafultSelectedIndex={userTrailsSelected ? 0 : 1}
            activeButtonStyle={styles.button}
            buttonsStyle={{ borderRadius: 5, margin: 0, paddingVertical: 8 }}
            unActiveTextColor={color.DarkGreen}
            onClickLeft={() => { setUserTrailsSelected(true); }}
            onClickRight={() => { setUserTrailsSelected(false); }}
            leftText="My Trails"
            rightText="Community Trails" />
        </View>
        { // This gnarly boolean stuff just puts a spin wheel on the lists before they load
          ((loading && userTrailsSelected) || (commLoading && !userTrailsSelected))
          && <ActivityIndicator style={{ padding: 50 }} size="large" color={color.DarkBlue} />}
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.uid.toString()}
          extraData={selectedId}
          style={styles.listContainer}
        />
        <BottomSheet
          snapPoints={["1", "99%"]}
          ref={bottomSheetRef}
          animateOnMount={false}
          android_keyboardInputMode="adjustPan"
          enablePanDownToClose={true}
          onClose={() => setSelectedId(undefined)}
          index={selectedId === undefined ? 0 : 1}>
          {(loading || commLoading) && <ActivityIndicator style={{ padding: 50 }} size="large" color={color.DarkBlue} />}
          {((!loading && userTrailsSelected) || (!commLoading && !userTrailsSelected))
            && selectedId !== undefined &&
            <ScrollView>
              <TrailDetails
                trailInfo={getSelectedItem(selectedId)}
                backPressHandler={() => {
                  setSelectedId(undefined)
                  bottomSheetRef.current?.close();
                }}
                deletePressHandler={() => deleteTrail(selectedId)}
                maxDanger={selectedDanger}
                community={!userTrailsSelected}
                pressHandler={() => {
                  if (communityData[+selectedId])
                    dispatch(setCurrentTrail(communityData[+selectedId]));
                  else
                    dispatch(setCurrentTrail(userData[+selectedId]));
                  navigation.navigate("Map");
                }} />
            </ScrollView>}
        </BottomSheet>
        {selectedId === undefined && renderSearch()}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 5,
    backgroundColor: color.LightBG,
    borderWidth: 1,
    elevation: 5,
    borderColor: color.DarkGreen
  },
  clearSearchButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color.DarkBlue,
    borderRadius: 8,
    marginVertical: 5,
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  searchBar: {
    backgroundColor: color.LightBG,
    borderRadius: 5,
    margin: 12,
    borderWidth: 1,
    paddingHorizontal: 5,
    justifyContent: "space-between",
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: color.ExtraDarkGreen,
  },
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 0.85,
  },
  headerContainer: {
    flex: 0.09,
    minHeight: 28,
    maxHeight: 55,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: color.ExtraDarkGreen,
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: color.DarkBlue,
    borderRadius: 8,
  }
})
