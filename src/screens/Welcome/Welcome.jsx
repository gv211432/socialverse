import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { View } from 'react-native';

const Welcome = () => {
  return (
    <>
      <View style={styles.welcome}>
        <Text>
          Welcome
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  welcome:{
    backgroundColor:"pink",
    alignItems:"center",
    alignContent:"center",
    justifyContent:"center",
    height:"100%"
  }
})

export default Welcome;
