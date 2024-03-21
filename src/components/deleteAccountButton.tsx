import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useEffect } from "react";
import { auth, db } from '../../Firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { User, deleteUser } from 'firebase/auth';
import { color } from '../../assets/colors';

const DeleteAccountButton = ({ navigation, route }: any) => {
    const uid: string = auth.currentUser?.uid || "";

    useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
    if (!user) {
        navigation.replace("Splash");
    }
    });
    return unsubscribe;
    }, []);

    const deleteAccount = async () => {
        // Get the user from the database      
        const docRef = doc(db, "Users", uid);
        const docSnap = await getDoc(docRef);
        const user = docSnap.data();

        if (!user) {
            console.error("User not found in the database! This should never happen.");
            alert("There was an error when deleting your account. Please contact support.");
            return;
        }

        // Remove the user from the database
        await deleteDoc(doc(db,"Users",uid))

        if(auth.currentUser)
        {
            const currentUser: User = auth.currentUser;
            // Remove the users account
            deleteUser(currentUser).then(() => {
                alert("Acccount Deleted!");
            }).catch((error) => {
                alert("Account could not be deleted!!");

                // Revert changes upon failure
                setDoc(doc(db, "Users", user.uid), user);
            });

        }

    }

    return (
        <Pressable style={styles.button} onPress={deleteAccount}>
            <Text style={styles.buttonText}>Delete Account</Text>
        </Pressable>
    );
};

export default DeleteAccountButton;
const styles = StyleSheet.create({
    button: {
        backgroundColor: color.ExtraLightBlue,
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        width: 150,
        alignItems: 'center',
        marginTop: 20,
        marginHorizontal: 2,
    },
    buttonText: {
        color: color.Black,
        fontSize: 16,
    },
});