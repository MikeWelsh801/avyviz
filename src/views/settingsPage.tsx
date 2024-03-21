/*
Create a simple settings page with a logout button
*/

import React from 'react';
import { StyleSheet, Text, View, Button } from "react-native";
import { useEffect } from "react";
import { auth, db } from '../../Firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import LogoutButton from '../components/logoutButton';
import DeleteAccountButton from '../components/deleteAccountButton';
import NotificationManager from '../components/notificationManager';

const Settings = ({ navigation, route }: any) => {

  return (
    <View style={styles.container}>
      <NotificationManager navigation={navigation} route={route} />
      <LogoutButton navigation={navigation} route={route} />
      <DeleteAccountButton navigation={navigation} route={route} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
});

export default Settings;