import { StyleSheet, View, Pressable, Text } from 'react-native';
import FontAwesome from "@expo/vector-icons/FontAwesome"
import React from 'react';
import {color} from '../../assets/colors'

type ButtonProps = {
  label: string,
  onPressHandler: (() => void) | undefined,
};

export default function SaveButton({ onPressHandler }: ButtonProps) {
  return (
      <Pressable
        style={[styles.button, { backgroundColor: color.Blue}]}
        onPress={onPressHandler}
      >
        <FontAwesome
          name="save"
          size={30}
          color={color.Black}
          style={styles.buttonIcon}
        />
        {
        // <Text style={[styles.buttonLabel, { color: "#25292e" }]}>{label}</Text>
        }
      </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 13,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    maxHeight: 45,
    maxWidth: 45,
    marginVertical: 5,
    marginHorizontal: 5
  },
  buttonIcon: {
    paddingLeft: 1,
  },
  // buttonLabel: {
  //   color: '#fff',
  //   fontSize: 16,
  // },
});
