import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Link} from 'react-router-native';
import {AuthContext, signInWithPhoneNumber} from '../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import Nav from './Nav';
import {useHistory} from 'react-router';
import OTPInputView from '@twotalltotems/react-native-otp-input';

const Login = () => {
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const {user} = useContext(AuthContext);
  let history = useHistory();
  useEffect(() => {
    if (user) {
      if (user.displayName == null && confirm != null) {
        user
          .updateProfile({
            displayName: id,
          })
          .then(() => {
            console.log('user displayName updated');
          })
          .catch(e => console.log(e));
      }
      // history.push('/ClassList');
    }
  }, [confirm]);

  // async function confirmCode() {
  //   try {
  //     await confirm.confirm(code);
  //   } catch (error) {
  //     createTwoButtonAlert(error);
  //   }
  // }

  if (!confirm) {
    return (
      <>
        <ScrollView>
          <Text style={styles.span}>Phone number</Text>
          <TextInput
            style={styles.numberInput}
            value={id}
            placeholder="+639976447771"
            keyboardType="numeric"
            onChangeText={text => setPhoneNumber(text)}
          />
          <View style={styles.button}>
            <Button
              title="Log in"
              onPress={() => {
                signInWithPhoneNumber(
                  phoneNumber,
                  setConfirm,
                  createTwoButtonAlert,
                );
              }}
            />
          </View>
          <Link to="/Register" underlayColor="#f0f4f7">
            <Text style={styles.link}>
              Don't have an account yet? Sign up here
            </Text>
          </Link>
        </ScrollView>
        <Nav />
      </>
    );
  }

  return (
    <>
      <ScrollView>
        <View
          style={{
            alignItems: 'center',
          }}>
          <Text
            style={[
              styles.header,
              {fontSize: 26, fontWeight: 'bold', top: 100},
            ]}>
            OTP Code
          </Text>
          <OTPInputView
            style={{
              width: '80%',
              alignItems: 'center',
              justifyContent: 'center',
              height: 400,
            }}
            pinCount={6}
            autoFocusOnLoad
            codeInputFieldStyle={styles.underlineStyleBase}
            codeInputHighlightStyle={styles.underlineStyleHighLighted}
            onCodeFilled={async code => {
              try {
                await confirm.confirm(code);
              } catch (error) {
                createTwoButtonAlert(error);
              }
            }}
          />
        </View>
        {/* <TextInput
          keyboardType="numeric"
          value={code}
          style={styles.numberInput}
          onChangeText={text => setCode(text)}
        />
        <View style={styles.button}>
          <Button title="Confirm Code" onPress={() => confirmCode()} />
        </View> */}
      </ScrollView>
      <Nav />
    </>
  );
};

const createTwoButtonAlert = e =>
  Alert.alert('Error', `${e ? e : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => console.log('OK Pressed')},
  ]);

const styles = StyleSheet.create({
  numberInput: {
    marginHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: 'teal',
    padding: 0,
  },
  header2: {
    fontSize: 18,
    marginTop: 10,
    marginLeft: 20,
  },
  span: {
    color: '#666',
    fontSize: 12,
    marginTop: 10,
    marginLeft: 20,
  },
  link: {
    color: 'dodgerblue',
    padding: 0,
    margin: 10,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  button: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  borderStyleBase: {
    width: 30,
    height: 45,
  },

  borderStyleHighLighted: {
    borderColor: '#03DAC6',
  },

  underlineStyleBase: {
    width: 30,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 1,
    color: 'black',
    fontWeight: 'bold',
  },

  underlineStyleHighLighted: {
    borderColor: '#03DAC6',
  },
});

export default Login;
