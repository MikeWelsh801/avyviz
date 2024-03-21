/**
 * This is the login splash screen. It is the first screen the user sees when they open the app and are not logged in.
 */
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image,} from 'react-native';
import { useFonts, Roboto_400Regular } from '@expo-google-fonts/roboto';

const LoginSplash = ({navigation}: any) => {

    const logo = require("../../assets/AvyVizIcon.png");
    const [fontsLoaded] = useFonts({
        Roboto_400Regular,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.Title}>AVYVIZ</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonSignUp} onPress={() => {navigation.navigate("Sign Up")}}>
                    <Text style={styles.buttonTextSignUp}>Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonSignIn} onPress={() => {navigation.navigate("Log In")}}>
                    <Text style={styles.buttonTextSignIn}>Sign In</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

};



// Remake the above styles to have responsive sizing
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    logo: {
        width: '60%', // Percentage of parent container
        height: '30%', // Percentage of parent container
        marginBottom: '2%' // Percentage of parent container
    },
    buttonContainer: {
        position: 'absolute',
        bottom: '5%', // Percentage of parent container
        width: '100%',
        alignItems: 'center'
    },
    buttonSignIn: {
        backgroundColor: '#FFFFFF',
        paddingVertical: '2%', // Percentage of parent container
        paddingHorizontal: '26%', // Percentage of parent container
        borderRadius: 5, // Percentage of parent container
        marginVertical: '1%', // Percentage of parent container
        borderWidth: 1,
    },
    buttonSignUp: {
        backgroundColor: '#2980B9',
        paddingVertical: '2%', // Percentage of parent container
        paddingHorizontal: '25%', // Percentage of parent container
        borderRadius: 5, // Percentage of parent container
        marginVertical: '1%', // Percentage of parent container
        borderWidth: 1,
    },
    buttonTextSignUp: {
        color: '#fff',
        fontSize: 20, // Percentage of parent container
    },
    buttonTextSignIn: {
        color: '#2980B9',
        fontSize: 20, // Percentage of parent container
    },
    Title: {
        marginBottom: '25%', // Percentage of parent container
        fontSize: 50, // Percentage of parent container
        fontFamily: 'Roboto_400Regular',
    }
});


export default LoginSplash;