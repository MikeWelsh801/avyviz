import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { useEffect } from "react";
import { auth, db } from "../../Firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { color } from "../../assets/colors";

const LogoutButton = ({ navigation, route }: any) => {
  const uid: string = auth.currentUser?.uid || "";
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigation.replace("Splash");
      }
    });
    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      // Get the user from the database
      const docRef = doc(db, "Users", uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("There was an error logging out. Please contact support. Doc does not exist.");
        return;
      }
      
      const user = docSnap.data();

      if (!user) {
        alert("There was an error logging out. Please contact support. User does not exist.");
        return;
      }

      // Remove the push token from the user's devicePushTokens array
      if(route.params.pushToken != undefined) {
        if (user.devicePushTokens.includes(route.params.pushToken.data)) {
          user.devicePushTokens = user.devicePushTokens.filter(
            (token: string) => token !== route.params.pushToken.data
          );
        }
      }


      // Update user data in database
      await updateDoc(doc(db, "Users", uid), user);

      // Sign out
      await auth.signOut();
    } catch (err: any) {
      console.log("error signing out...", err);
      alert(err.message);
    }
  };

  return (
    <Pressable style={styles.button} onPress={signOut}>
      <Text style={styles.buttonText}>Logout</Text>
    </Pressable>
  );
};

export default LogoutButton;
const styles = StyleSheet.create({
  button: {
    backgroundColor: color.ExtraLightBlue,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: 150,
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 2,
  },
  buttonText: {
    color: color.Black,
    fontSize: 16,
  },
});
