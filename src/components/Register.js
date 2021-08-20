import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {Link} from 'react-router-native';
import {useHistory} from 'react-router';
import {AuthContext, signInWithPhoneNumber} from '../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import Nav from './Nav';

const Register = ({isLoading, setIsLoading}) => {
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [id, setId] = useState('');
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
          console.log(user);
          history.push('/ClassList');
        })
        .catch(e => console.log(e));
    }
  }, [user, confirm, state, isLoading]);

  function confirmCode() {
    confirm
      .confirm(code)
      .then(res => {
        firestore()
          .collection('users')
          .doc(id)
          .set({
            id: id,
            isStudent: isStudent,
            phoneNumber: phoneNumber,
            classes: [],
          })
          .then(() => {
            setState(true);
            console.log(user);
            setIsLoading(false);
          })
          .catch(e => {
            setIsLoading(false);
            console.log(e);
          });
      })
      .catch(e => {
        setIsLoading(false);
        console.log(e);
      });
  }

  if (!confirm) {
    return (
      <>
        <ScrollView>
          <Text style={styles.span}>ID</Text>
          <TextInput
            style={styles.numberInput}
            value={id}
            placeholder="04210001"
            keyboardType="numeric"
            onChangeText={text => setId(text)}
          />
          <Text style={styles.span}>Phone number</Text>
          <TextInput
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
                fontSize: 12,
                marginTop: 10,
                marginHorizontal: 20,
              }}>
              I'm a :
            </Text>
            <Button
              title="Student"
              disabled={isLoading}
              color={isStudent ? 'dodgerblue' : '#ccc'}
              onPress={() => setIsStudent(true)}
            />
            <Button
              title="Teacher"
              disabled={isLoading}
              color={!isStudent ? 'dodgerblue' : '#ccc'}
              onPress={() => setIsStudent(false)}
            />
          </View>

          <View style={styles.button}>
            <Button
              title="Sign up"
              disabled={isLoading}
              onPress={() => {
                signInWithPhoneNumber(
                  phoneNumber,
                  setConfirm,
                  createTwoButtonAlert,
                  setIsLoading,
                );
              }}
            />
          </View>
          <Link to="/Login" underlayColor="#f0f4f7" disabled={isLoading}>
            <Text style={styles.link}>
              already have an account? Log in here
            </Text>
          </Link>
        </ScrollView>
        <Nav isLoading={isLoading} />
      </>
    );
  }
  return (
    <>
      <ScrollView>
        <TextInput
          keyboardType="numeric"
          value={code}
          style={styles.numberInput}
          onChangeText={text => setCode(text)}
        />
        <View style={styles.button}>
          <Button title="Confirm Code" onPress={() => confirmCode()} />
        </View>
      </ScrollView>
      <Nav isLoading={isLoading} />
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
  toggle: {
    marginVertical: 10,
    flexDirection: 'row',
  },
});

export default Register;
