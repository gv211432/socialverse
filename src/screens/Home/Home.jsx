import React, { useContext, useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import UserContext from '../../context/userContext';
import axiosInstance from '../../helpers/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// import { Image } from 'react-native';

const Home = () => {
  const { name } = useContext(UserContext);
  const [data, setData] = useState(null);
  const [fadeAnimation] = useState(new Animated.Value(0));
  const fetchData = async () => {
    const res = await axiosInstance.get("/feed?page=1");
    if (res.status == 200) {
      setData(res?.data);
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true
      }).start();
    }
  };
  // useEffect(() => { fetchData(); }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnimation,
      }}
    >
      <View style={styles.container}>
        <Image
          style={styles.image}
          source="https://picsum.photos/seed/696/3000/2000"
          // source={d?.category?.image_url}
          // placeholder={blurhash}
          contentFit="cover"
          transition={1000}
        />
        <StatusBar style="auto" />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0553',
  },
});

export default Home;