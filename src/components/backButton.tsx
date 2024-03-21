import { StyleSheet, Pressable } from 'react-native';
import FontAwesome from "@expo/vector-icons/FontAwesome"
import React from 'react';
import { color } from '../../assets/colors'

type ButtonProps = {
  label: string,
  onPressHandler: (() => void) | undefined,
};

export default function BackButton({ onPressHandler }: ButtonProps) {
  return (
    <Pressable
      style={[styles.button, { backgroundColor: color.DarkBlue }]}
      onPress={onPressHandler}
    >
      <FontAwesome
        name="backward"
        size={25}
        color={"white"}
        style={styles.buttonIcon}
      />
      <FontAwesome
        name="map-signs"
        size={25}
        color={"white"}
        style={styles.buttonIcon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    borderWidth: 0.6,
    flexDirection: "row",
    borderColor: color.ExtraLightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonIcon: {
    padding: 5,
    paddingHorizontal: 15,
  },
});
