import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { auth } from "./Firebase";
import { useEffect, useState, useRef } from "react";
import Login from "./src/views/loginPage";
import SignUp from "./src/views/SignUp";
import LoginSplash from "./src/views/loginSplash";
import Settings from "./src/views/settingsPage";
import * as React from "react";
import Map from "./src/views/Map";
import ForecastView from "./src/views/forecastView";
import ObservationListView from "./src/views/observationListView";
import * as SplashScreen from "expo-splash-screen";
import * as Network from "expo-network";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "firebase/auth";
import downloadForecast from "./src/splash_screen_helpers/downloadForecast";
import { AvalancheCenter } from "./src/generic_helpers/avalancheCenterInfo";
import DownloadRegions from "./src/views/downloadRegions";
import TrailsView from "./src/views/trailsView";
import { store } from "./src/store";
import { Provider } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { usePushNotifications } from "./src/generic_helpers/notificationHelpers";
import PasswordReset from "./src/views/passwordReset";
import downloadObservations from "./src/splash_screen_helpers/downloadObservations";

const Drawer = createDrawerNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [navigationContainerReady, setNavigationContainerReady] = useState<boolean>(false);
  const [dataReady, setDataReady] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [appReady, setAppReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  SplashScreen.preventAutoHideAsync();
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });

    if (!dataReady && !loading) {
      setLoading(true); // loading is expensive don't call more than once
      loadDataOnSplashScreen(setDataReady);
    }
    //only hide splash screen once the app gets the data needed and ready to render.
    if (navigationContainerReady && dataReady && authReady) {
      setAppReady(true);
      SplashScreen.hideAsync();
    }
    //I don't need this here but I'm just commenting it out.
    //return unsubscribe;
  }, [navigationContainerReady, dataReady, authReady]);

  const { expoPushToken } = usePushNotifications();
  console.log(expoPushToken);

  return (
    // <GestureHandlerRootView style={{ flex: 1 }}>
    <Provider store={store}>
      <NavigationContainer independent={true} onReady={() => setNavigationContainerReady(true)}>
        {appReady &&
          (user ? (
            <Drawer.Navigator>
              <Drawer.Screen name="Map" component={Map} options={{ headerTransparent: true, headerTitle: "" }} />
              <Drawer.Screen name="Observations" component={ObservationListView} />
              <Drawer.Screen name="Download Settings" component={DownloadRegions} />
              <Drawer.Screen name="Settings" initialParams={{pushToken: expoPushToken}} component={Settings} />
              <Drawer.Screen name="Forecast" component={ForecastView} />
              <Drawer.Screen name="Trails" component={TrailsView} />
            </Drawer.Navigator>
          ) : (
            <Drawer.Navigator screenOptions={{ headerShown: false }}>
              <Drawer.Screen name="Splash" component={LoginSplash} />
              <Drawer.Screen name="Sign Up" initialParams={{ pushToken: expoPushToken }} component={SignUp} />
              <Drawer.Screen name="Log In" initialParams={{ pushToken: expoPushToken }} component={Login} />
              <Drawer.Screen name="Password Reset" component={PasswordReset} />
            </Drawer.Navigator>
          ))}
      </NavigationContainer>
    </Provider>
    // </GestureHandlerRootView>
  );
}

async function loadDataOnSplashScreen(setDataReady: React.Dispatch<React.SetStateAction<boolean>>) {
  //check if user has internet
  let network = await Network.getNetworkStateAsync();
  if (network.isConnected) {
    await downloadForecast(AvalancheCenter.UAC);
    //Add any data we need to load before the app starts here.
    await downloadObservations(AvalancheCenter.UAC);
  }
  setDataReady(true);
}
