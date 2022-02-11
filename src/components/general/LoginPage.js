import React, {useContext, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import {onGoogleButtonPress} from '../../context/AuthContext';
import IconLib from '../../../assets/login.svg';
import Nav from './Nav';

const LoginPage = () => {
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => true);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  return (
    <>
      <ScrollView style={{height: '90%'}}>
        <View style={styles.iconLogin}>
          <IconLib height={250} width={400} />
          <Text style={styles.iconText}>Read App</Text>
        </View>

        <View style={styles.container}>
          <TouchableOpacity onPress={onGoogleButtonPress} style={styles.button}>
            <Text>GOOGLE SIGN-IN</Text>
          </TouchableOpacity>

          <Text style={styles.span}>
            Open your google account to login or sign up in ReadApp
          </Text>
        </View>
      </ScrollView>
      <Nav />
    </>
  );
};

const styles = StyleSheet.create({
  container: {marginTop: 20},
  span: {
    fontSize: 12,
    marginTop: 10,
    color: '#000',
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
  },
  button: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#ADD8E6',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 5,
  },

  iconLogin: {
    alignSelf: 'center',
    padding: 15,
  },
  iconText: {
    fontFamily: 'Lato-Regular',
    fontSize: 30,
    textAlign: 'center',
  },
});

export default LoginPage;
