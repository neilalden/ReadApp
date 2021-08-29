import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  BackHandler,
} from 'react-native';
import {Link} from 'react-router-native';
import {useHistory} from 'react-router';
import {AuthContext, signInWithPhoneNumber} from '../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import Nav from './Nav';
import OTPInputView from '@twotalltotems/react-native-otp-input';

const Register = () => {
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [isStudent, setIsStudent] = useState(true);
  const [state, setState] = useState(false);
  const {user} = useContext(AuthContext);
  let history = useHistory();
  useEffect(() => {
    if (user !== null) {
      user
        .updateProfile({
          displayName: id,
        })
        .then(() => {
          history.push('/ClassList');
        })
        .catch(e => alert(e));
    }

    BackHandler.addEventListener('hardwareBackPress', () => true);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [user, confirm, state]);

  if (!confirm) {
    return (
      <>
        <ScrollView>
          <Text style={styles.span}>ID</Text>
          <TextInput
            selectionColor="black"
            style={styles.numberInput}
            value={id}
            placeholder="04210001"
            keyboardType="numeric"
            onChangeText={text => setId(text)}
          />
          <Text style={styles.span}>Full name</Text>
          <TextInput
            selectionColor="black"
            style={styles.numberInput}
            value={name}
            placeholder="Juan Dela Cruz"
            onChangeText={text => setName(text)}
          />
          <Text style={styles.span}>Phone number</Text>
          <TextInput
            selectionColor="black"
            style={styles.numberInput}
            value={phoneNumber}
            placeholder="+6399876543210"
            keyboardType="numeric"
            onChangeText={text => setPhoneNumber(text)}
          />

          <View style={styles.toggle}>
            <Text
              style={{
                color: '#666',
                fontFamily: 'Lato-Regular',
                fontSize: 15,
                marginTop: 10,
                marginHorizontal: 20,
              }}>
              I'm a :
            </Text>
            <Button
              title="Student"
              color={isStudent ? '#ADD8E6' : '#ccc'}
              onPress={() => setIsStudent(true)}
            />
            <Button
              title="Teacher"
              color={!isStudent ? '#ADD8E6' : '#ccc'}
              onPress={() => setIsStudent(false)}
            />
          </View>

          <View style={styles.button}>
            <Button
              color="#ADD8E6"
              title="Sign up"
              onPress={() => {
                signInWithPhoneNumber(
                  phoneNumber,
                  setConfirm,
                  createTwoButtonAlert,
                );
              }}
            />
          </View>
          <Link to="/Login" underlayColor="#f0f4f7">
            <Text style={styles.link}>
              already have an account? Log in here
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
            onCodeFilled={code => {
              confirm
                .confirm(code)
                .then(res => {
                  firestore()
                    .collection('users')
                    .doc(id)
                    .set({
                      id: id,
                      name: name,
                      isStudent: isStudent,
                      phoneNumber: phoneNumber,
                      classes: [],
                    })
                    .then(() => {
                      setState(true);
                    })
                    .catch(e => {
                      alert(e);
                    });
                })
                .catch(e => {
                  alert(e);
                });
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
    {text: 'OK', onPress: () => true},
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
  toggle: {
    marginVertical: 10,
    flexDirection: 'row',
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

export default Register;
