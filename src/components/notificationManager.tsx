import React from "react";
import { StyleSheet, Switch, View, Text } from "react-native";
import { useState, useEffect } from "react";
import { auth, db } from "../../Firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { color } from "../../assets/colors";

const NotificationManager = ({ navigation, route }: any) => {
  const uid: string = auth.currentUser?.uid || "";
  // Notification Subscriptions
  const [abajos, setAbajos] = useState<boolean>(false);
  const [logan, setLogan] = useState<boolean>(false);
  const [moab, setMoab] = useState<boolean>(false);
  const [saltLake, setSaltLake] = useState<boolean>(false);
  const [ogden, setOgden] = useState<boolean>(false);
  const [provo, setProvo] = useState<boolean>(false);
  const [skyline, setSkyline] = useState<boolean>(false);
  const [southwest, setSouthwest] = useState<boolean>(false);
  const [uintas, setUintas] = useState<boolean>(false);

  // Get the current user's notification subscriptions when the component mounts
  useEffect(() => {
    // Get the current user's notification subscriptions
    (async () => {
      const docRef = doc(db, "Users", uid);
      const docSnap = await getDoc(docRef);
      const user = docSnap.data();

      if (!user) {
        console.error("User not found in the database! This should never happen.");
        alert("There was an error logging out. Please contact support.");
        return;
      }

      const currentSubscriptions: String[] = user.notifications;

      // Update the state variables
      currentSubscriptions.forEach((subscription: String) => {
        switch (subscription) {
          case "abajos":
            setAbajos(true);
            break;
          case "logan":
            setLogan(true);
            break;
          case "moab":
            setMoab(true);
            break;
          case "saltlake":
            setSaltLake(true);
            break;
          case "ogden":
            setOgden(true);
            break;
          case "provo":
            setProvo(true);
            break;
          case "skyline":
            setSkyline(true);
            break;
          case "southwest":
            setSouthwest(true);
            break;
          case "uintas":
            setUintas(true);
            break;
          case "none":
            break;
          default:
            console.error("Invalid subscription found in database!");
            break;
        }
      });
    })();
  }, []);

  // Update the user's notification subscriptions when the user presses buttons
  useEffect(() => {
    // Get the current user's notification subscriptions
    (async () => {
      const docRef = doc(db, "Users", uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.error("User not found in the database! This should never happen.");
        alert("There was an error logging out. Please contact support.");
        return;
      }
      const user = docSnap.data();

      const newSubscriptions: String[] = [];

      // Update the state variables
      if (abajos) {
        newSubscriptions.push("abajos");
      }
      if (logan) {
        newSubscriptions.push("logan");
      }
      if (moab) {
        newSubscriptions.push("moab");
      }
      if (saltLake) {
        newSubscriptions.push("saltlake");
      }
      if (ogden) {
        newSubscriptions.push("ogden");
      }
      if (provo) {
        newSubscriptions.push("provo");
      }
      if (skyline) {
        newSubscriptions.push("skyline");
      }
      if (southwest) {
        newSubscriptions.push("southwest");
      }
      if (uintas) {
        newSubscriptions.push("uintas");
      }
      if (newSubscriptions.length === 0) {
        newSubscriptions.push("none");
      }

      user.notifications = newSubscriptions;

      // Update the database
      await updateDoc(docRef, user);
    })();
  }, [abajos, logan, moab, saltLake, ogden, provo, skyline, southwest, uintas]);

  return (
    // Return a view with a switch for each notification subscription
    <View>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        {" "}
        Notification Region Subscriptions{" "}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={abajos ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setAbajos(!abajos)}
          value={abajos}
        />
        <Text style={{ marginLeft: 10 }}> Abajos </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={logan ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setLogan(!logan)}
          value={logan}
        />
        <Text style={{ marginLeft: 10 }}> Logan </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={moab ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setMoab(!moab)}
          value={moab}
        />
        <Text style={{ marginLeft: 10 }}> Moab </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={saltLake ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setSaltLake(!saltLake)}
          value={saltLake}
        />
        <Text style={{ marginLeft: 10 }}> Salt Lake </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={ogden ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setOgden(!ogden)}
          value={ogden}
        />
        <Text style={{ marginLeft: 10 }}> Ogden </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={provo ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setProvo(!provo)}
          value={provo}
        />
        <Text style={{ marginLeft: 10 }}> Provo </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={skyline ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setSkyline(!skyline)}
          value={skyline}
        />
        <Text style={{ marginLeft: 10 }}> Skyline </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={southwest ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setSouthwest(!southwest)}
          value={southwest}
        />
        <Text style={{ marginLeft: 10 }}> Southwest </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={uintas ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setUintas(!uintas)}
          value={uintas}
        />
        <Text style={{ marginLeft: 10 }}> Uintas </Text>
      </View>
    </View>
  );
};

export default NotificationManager;
const styles = StyleSheet.create({
  button: {
    backgroundColor: color.ExtraLightBlue,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: 150,
    alignSelf: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: color.Black,
    fontSize: 16,
  },
});
