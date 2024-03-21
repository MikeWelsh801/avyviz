import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, ActivityIndicator, Pressable, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { auth } from '../../Firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const PasswordReset = ({ navigation }: any) => {
    // State Variables
    const [email, setEmail] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const resetPassword = async () => {
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth,email);
            alert("Email sent! Check your inbox for a link to reset your password.");
            
        } catch (error: any) {
            console.log(error);
            alert(error.message);
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

            <Text style={styles.text}>Enter your email</Text>
            <TextInput value={email} style={styles.input} placeholder="Email" onChangeText={(text) => setEmail(text)} />

            {loading ? (<ActivityIndicator size={"large"} color="#000ff" />) : (
                <View>
                    <Pressable onPress={() => resetPassword().then(()=>{navigation.navigate("Log In")})} style={styles.button}>
                        <Text style={styles.buttonTextStyle}>
                            Reset Password
                        </Text>
                    </Pressable>
                </View>
            )}
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
        paddingBottom: '2%',
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


export default PasswordReset;