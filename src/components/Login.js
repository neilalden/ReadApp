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
  KeyboardAvoidingView,
} from 'react-native';
import {Link} from 'react-router-native';
import {AuthContext, signInWithPhoneNumber} from '../context/AuthContext';
// import firestore from '@react-native-firebase/firestore';
import Nav from './Nav';
import {useHistory} from 'react-router';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import IconLib from '../../assets/login.svg';

const Login = () => {
  // const [code, setCode] = useState('');
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
        <View style={styles.iconLogin}>
          <IconLib height={250} width={400} />
          <Text style={styles.iconText}>Read App</Text>
        </View>
        <KeyboardAvoidingView>
          <ScrollView>
            <Text style={styles.span}>Phone number</Text>
            <TextInput
              selectionColor="black"
              style={styles.numberInput}
              value={phoneNumber}
              placeholder="+639976447771"
              keyboardType="numeric"
              onChangeText={text => setPhoneNumber(text)}
            />
            <View style={styles.button}>
              <Button
                color="#ADD8E6"
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
        </KeyboardAvoidingView>
        <View style={styles.nav}>
          <Nav />
        </View>
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
    borderBottomColor: '#D6D6D6',
    padding: 0,
  },
  header2: {
    fontSize: 18,
    marginTop: 10,
    marginLeft: 20,
  },
  span: {
    color: '#666',
    fontSize: 15,
    marginTop: 10,
    marginLeft: 20,
    fontFamily: 'Lato-Regular',
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
  iconLogin: {
    alignSelf: 'center',
    padding: 15,
  },
  iconText: {
    fontFamily: 'Lato-Regular',
    fontSize: 30,
    textAlign: 'center',
  },
  nav: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
  },
});

export default Login;
