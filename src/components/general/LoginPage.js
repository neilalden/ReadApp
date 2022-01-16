import React, {useContext, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  BackHandler,
} from 'react-native';
import {useHistory} from 'react-router';
import {AuthContext, onGoogleButtonPress} from '../../context/AuthContext';
import IconLib from '../../../assets/login.svg';
import Nav from './Nav';

const LoginPage = ({userInfo, setUserInfo}) => {
  const {user} = useContext(AuthContext);
  const history = useHistory();
  useEffect(() => {
    if (user) {
      if (Object.keys(userInfo).length === 0) {
        // user logged in but no information on them
        fetchUser(user.displayName, setUserInfo);
        history.push('/');
      }
    }

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
          <View style={styles.button}>
            <Button
              color="#ADD8E6"
              title="Google Sign-In"
              onPress={onGoogleButtonPress}
            />
            <Text style={styles.span}>
              Open your google account to login or sign up in ReadApp
            </Text>
          </View>
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
