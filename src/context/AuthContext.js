import auth from '@react-native-firebase/auth';
import React, {useState, createContext, useEffect} from 'react';
import {Alert} from 'react-native';
import {useHistory} from 'react-router-native';

const AuthContextProvider = props => {
  const [user, setUser] = useState({});
  const history = useHistory();
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const onAuthStateChanged = user => {
    setUser(user);
    history.push('/');
  };

  return (
    <AuthContext.Provider value={{user, setUser}}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const AuthContext = createContext();
export const signInWithPhoneNumber = (
  phoneNumber,
  setConfirm,
  createTwoButtonAlert,
) => {
  if (phoneNumber) {
    auth()
      .signInWithPhoneNumber(phoneNumber)
      .then(confirmation => {
        setConfirm(confirmation);
      })
      .catch(e => {
        createTwoButtonAlert(e);
        alert('Error', e);
      });
  } else {
    createTwoButtonAlert();
  }
};

export const signOut = () => {
  auth()
    .signOut()
    .then(() => {})
    .catch(err => alert('Error', err));
};
const alert = (title, msg) => {
  Alert.alert(
    `${title ? title : 'Error'}`,
    `${msg ? msg : 'Fill up the form properly'}`,
    [{text: 'OK', onPress: () => true}],
  );
};

export default AuthContextProvider;
