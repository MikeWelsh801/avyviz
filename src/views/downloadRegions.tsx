import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { AvalancheCenter, getAvalancheCenterRegions } from "../generic_helpers/avalancheCenterInfo";
import { SafeAreaView } from "react-native-safe-area-context";
import DownloadTile from "../components/downloadTile";
import { ScrollView } from "react-native-gesture-handler";
import DropDownPicker from "react-native-dropdown-picker";
import { color } from "../../assets/colors";

/**
 * @returns Map Download Screen for each region.
 */
export default function DownloadRegions() {
  const [avalancheCenter, setAvalancheCenter] = useState(AvalancheCenter.UAC);
  const [regions, setRegions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([{ label: "UTAH AVALANCHE CENTER", value: AvalancheCenter.UAC }]);

  useEffect(() => {
    setRegions(getAvalancheCenterRegions(avalancheCenter));
  }, [avalancheCenter]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Choose Avalanche Center</Text>
      <DropDownPicker open={open} value={avalancheCenter} items={items} setOpen={setOpen} setValue={setAvalancheCenter} setItems={setItems} style={styles.dropdown} />
      <Text style={styles.warning}>WARNING: When downloading do not exit the page until the download is finished. We also recommend using WIFI.</Text>
      <ScrollView>
        {regions.map((region, i) => (
          <DownloadTile regionName={region} avalancheCenter={avalancheCenter} key={i} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.LightBG,
    //alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
    padding: 5,
  },
  dropdown: {
    borderColor: color.ExtraDarkGreen,
    borderWidth: 2,
    overflow: "hidden",
    borderStyle: "solid",
    height: 50,
    marginBottom: 10,
  },
  warning: {
    backgroundColor: color.Orange,
    borderColor: color.Black,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 2,
    margin: 5,
    padding: 5,
  },
  title: {
    textAlign: "center",
    margin: 5,
    fontSize: 15,
  },
});
