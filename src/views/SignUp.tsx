/*
* Sign Up View
*/
import {View, Text, StyleSheet, TextInput, KeyboardAvoidingView, ActivityIndicator, Button, Pressable, TouchableOpacity} from 'react-native';
import React, { useEffect } from 'react';
import { auth, db } from '../../Firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';


const SignUp = ({navigation, route}: any) => {
    // State Variables
    const [email, setEmail] = React.useState("");
    const [confirmEmail, setConfirmEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const signUp = async () => {
        if (email !== confirmEmail && password != confirmPassword) {
            alert("Emails do not match AND passwords do not match!");
            return;
        }

        if (email != confirmEmail) {
            alert("Emails do not match!");
            return;
        }

        if (password != confirmPassword) {
            alert("Passwords do not match!");
            return;
        }


        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);
            
            // Add user to database if the account
            const { pushToken } = route.params;
            const data = {
                id: response.user.uid,
                email: email,
                notifications: ["none"],
                devicePushTokens: [pushToken?.data || ""],
            };
    
            await setDoc(doc(db, "Users", response.user.uid), data);
        } catch (error: any) {
            alert(error.message);
            console.log("Error signing up: ", error.message);
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
            <Text style={styles.text}>AVYVIZ Sign Up</Text>
            <TextInput value={email} style={styles.input} placeholder="Email" onChangeText={(text) => setEmail(text.toLocaleLowerCase())} />
            <TextInput value={confirmEmail} style={styles.input} placeholder="Confirm Email" onChangeText={(text) => setConfirmEmail(text.toLowerCase())} />
            <TextInput value={password} style={styles.input} placeholder="Password" onChangeText={(text) => setPassword(text)} secureTextEntry={true} />
            <TextInput value={confirmPassword} style={styles.input} placeholder="Confirm Password" onChangeText={(text) => setConfirmPassword(text)} secureTextEntry={true} />

            { loading ? (<ActivityIndicator size={"large"} color="#000ff" />) : (
                <View>
                    <Pressable onPress={() => signUp()} style={styles.button}>
                       <Text style={styles.buttonTextStyle}>
                       Sign Up
                       </Text>
                   </Pressable>
                </View>
            ) }
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

export default SignUp;