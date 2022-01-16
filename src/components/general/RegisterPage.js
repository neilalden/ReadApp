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
  KeyboardAvoidingView,
} from 'react-native';
import {useHistory} from 'react-router';
import {AuthContext} from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import Nav from './Nav';
import IconLib from '../../../assets/register.svg';

const RegisterPage = () => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isStudent, setIsStudent] = useState(true);
  const {user, setReload} = useContext(AuthContext);
  let history = useHistory();
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => true);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  return (
    <>
      <ScrollView>
        <View style={styles.iconLogin}>
          <IconLib height={250} width={400} />
          <Text style={styles.iconText}>Make your profile</Text>
        </View>
        <KeyboardAvoidingView>
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
          <View style={[styles.numberInput, {flexDirection: 'row'}]}>
            <Text
              style={{
                margin: 0,
                padding: 0,
                textAlignVertical: 'center',
              }}>
              (+63)
            </Text>
            <TextInput
              selectionColor="black"
              style={{
                margin: 0,
                padding: 0,
                width: '90%',
              }}
              value={phoneNumber}
              placeholder="9876543210"
              keyboardType="numeric"
              onChangeText={text => setPhoneNumber(text)}
            />
          </View>
        </KeyboardAvoidingView>

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
              if (id === '' || name === '' || phoneNumber === '') {
                alert('All fields are required');
                return;
              }
              if (phoneNumber.length !== 10) {
                alert(
                  'Phone number must have 11 digits\nNote* (+63) stands for 0',
                );
                return;
              }
              createAccount(
                id,
                name,
                isStudent,
                phoneNumber,
                user,
                history,
                setReload,
              );
            }}
          />
        </View>
      </ScrollView>
      <Nav />
    </>
  );
};

const createAccount = (
  id,
  name,
  isStudent,
  phoneNumber,
  user,
  history,
  setReload,
) => {
  firestore()
    .collection('users')
    .doc(id)
    .set({
      id: id,
      name: name,
      isStudent: isStudent,
      phoneNumber: `+63${phoneNumber}`,
      classes: [],
      photoUrl: user.photoURL,
    })
    .then(() => {
      user
        .updateProfile({
          displayName: id,
        })
        .then(() => {
          // needs stable connection, move to cloud functions
          firestore()
            .collection(`queues`)
            .doc(id)
            .get()
            .then(res => {
              if (res.data()) {
                let queuedClasses = res.data().classes;
                for (let i in queuedClasses) {
                  firestore()
                    .collection(`classes`)
                    .doc(queuedClasses[i])
                    .get()
                    .then(res => {
                      let qs = res.data().queues;
                      for (let i in qs) {
                        if (qs[i].id == id) {
                          qs.splice(i, 1);
                        }
                      }
                      let people = isStudent
                        ? res.data().students
                        : res.data().teachers;
                      people.push({
                        id: id,
                        name: name,
                        photoUrl: user.photoURL,
                      });
                      firestore()
                        .collection(`classes`)
                        .doc(queuedClasses[i])
                        .update(
                          isStudent
                            ? {students: people, queues: qs}
                            : {teachers: people, queues: qs},
                        )
                        .then()
                        .catch(e => alert(e));
                    })
                    .catch(e => alert(e));
                }
                firestore()
                  .collection(`queues`)
                  .doc(id)
                  .delete()
                  .then(() => {
                    firestore()
                      .collection('users')
                      .doc(id)
                      .update({classes: queuedClasses})
                      .then()
                      .catch(e => alert(e));
                  })
                  .catch(e => alert(e));
              }
            });
          setReload(prev => !prev);

          history.push('/');
        })
        .catch(e => {
          alert(`Error in making profile ${e}`);
        });
    })
    .catch(e => {
      alert(e);
    });
};

const alert = e =>
  Alert.alert('Error', `${e ? e : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => true},
  ]);
const styles = StyleSheet.create({
  iconLogin: {
    alignSelf: 'center',
    padding: 15,
  },
  iconText: {
    fontFamily: 'Lato-Regular',
    fontSize: 30,
    textAlign: 'center',
  },
  numberInput: {
    marginHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#D6D6D6',
    padding: 0,
  },
  span: {
    color: '#666',
    fontSize: 15,
    marginTop: 10,
    marginLeft: 20,
    fontFamily: 'Lato-Regular',
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

export default RegisterPage;
