/*
Login Page
*/
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, ActivityIndicator, Button, Pressable, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { auth, db } from '../../Firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const Login = ({ navigation, route }: any) => {
    // State Variables
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const { pushToken } = route.params || "";

    const signIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);

            // Retrieve user data from database
            const docRef = doc(db, "Users", response.user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                console.error("User not found in the database! This should never happen.... but it does sometimes :(");
                alert("There was an error logging in. Please contact support.");
                setLoading(false);
                return;
            }

            const user = docSnap.data();

            // Append push token to user data
            if (!user.devicePushTokens.includes(pushToken?.data) && pushToken?.data) {
                user.devicePushTokens.push(pushToken?.data);
            }

            // Update user data in database
            await updateDoc(doc(db, "Users", response.user.uid), user);
        } catch (error: any) {
            if (error.code == "auth/user-not-found") {
                alert("User not found! Please check your email and password and try again.");
            }
            else if (error.code == "auth/wrong-password") {
                alert("Incorrect password! Please check your password and try again.");
            }
            else {
                alert(error.message);
                console.log("Error signing in: ", error.message);
            }
        } finally {
            setLoading(false);
        }
    }


    // JSX
    return (
        <KeyboardAvoidingView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => {navigation.navigate("Splash")}}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.text}>AVYVIZ LOGIN</Text>
            <TextInput value={email} style={styles.input} placeholder="Email" onChangeText={(text) => setEmail(text)} />
            <TextInput value={password} style={styles.input} placeholder="Password" onChangeText={(text) => setPassword(text)} secureTextEntry={true} />

            {loading ? (<ActivityIndicator size={"large"} color="#000ff" />) : (
                <View>
                    <Pressable onPress={() => signIn()} style={styles.button}>
                        <Text style={styles.buttonTextStyle}>
                            Sign In
                        </Text>
                    </Pressable>
                </View>
            )}
        <TouchableOpacity onPress={() => {navigation.navigate("Password Reset")}}>
            <Text style={styles.link}>Forgot your password? Press here to reset!</Text>
        </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        paddingTop: '10%', 
    },
    input: {
        height: '5%', 
        width: '50%', 
        margin: '1%', 
        borderWidth: 1,
        padding: '1%', 
    },
    text: {
        fontSize: 20, 
        fontWeight: "bold",
        paddingBottom: '5%',
        paddingTop: '8%',
    },
    link: {
        fontSize: 9, 
        fontWeight: "bold",
        color: "blue",
        textDecorationLine: "underline",
        paddingTop: '1%', 
    },
    button: {
        backgroundColor: '#2980B9',
        paddingVertical: '2%', 
        paddingHorizontal: '15%', 
        borderRadius: 5, 
        marginVertical: '1%', 
        borderWidth: 1,
    },
    buttonTextStyle: {
        color: '#fff',
        fontSize: 16, 
    },
    backButton: {
        position: 'absolute',
        top: 40, 
        left: 10,  
        padding: 10 
    },
    backButtonText: {
        color: '#2980B9',
        fontSize: 20 
    }
});


export default Login;
