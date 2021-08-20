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

const Login = () => {
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [id, setId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

      history.push('/ClassList');
    }
  }, [confirm, isLoading]);

  async function confirmCode() {
    try {
      await confirm.confirm(code);
      setIsLoading(false);
    } catch (error) {
      createTwoButtonAlert(error);
      setIsLoading(false);
    }
  }

  if (!confirm) {
    return (
      <>
        <ScrollView>
          <Text style={styles.span}>ID</Text>
          <TextInput
            style={styles.numberInput}
            value={id}
            placeholder="04180622"
            keyboardType="numeric"
            onChangeText={text => setId(text)}
          />
          <View style={styles.button}>
            <Button
              title="Log in"
              disabled={isLoading}
              onPress={() => {
                setIsLoading(true);
                handleLogin(id, setConfirm, setIsLoading);
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
      <Nav />
    </>
  );
};

const createTwoButtonAlert = e =>
  Alert.alert('Error', `${e ? e : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => console.log('OK Pressed')},
  ]);

const handleLogin = (id, setConfirm, setIsLoading) => {
  console.log('fetching user...');
  firestore()
    .collection('users')
    .doc(id)
    .get()
    .then(res => {
      signInWithPhoneNumber(
        res._data.phoneNumber,
        setConfirm,
        createTwoButtonAlert,
        setIsLoading(),
      );
    })
    .catch(e => {
      createTwoButtonAlert(e);
      setIsLoading(false);
    });
};

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
});

export default Login;
