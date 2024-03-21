import { StyleSheet, Pressable } from 'react-native';
import FontAwesome from "@expo/vector-icons/FontAwesome"
import React from 'react';
import { color } from '../../assets/colors'

type ButtonProps = {
  label: string,
  onPressHandler: (() => void) | undefined,
};

export default function DeleteButton({ onPressHandler }: ButtonProps) {
  return (
    <Pressable
      style={styles.button}
      onPress={onPressHandler}
    >
      <FontAwesome
        name="trash-o"
        size={30}
        color={'white'}
        style={styles.iconStyle}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: color.Red,
    borderRadius: 7,
    padding: 10,
    margin: 5,
    elevation: 3,
    shadowColor: color.Black,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
  },
  iconStyle: {
    paddingHorizontal: 5,
  }
});
