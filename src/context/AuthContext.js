import auth from '@react-native-firebase/auth';
import React, {useState, createContext, useEffect} from 'react';
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
        console.log(e);
      });
  } else {
    createTwoButtonAlert();
  }
};

export const signOut = () => {
  auth()
    .signOut()
    .then(() => {
      console.log('User signed out!');
    })
    .catch(err => console.log(err));
};

export default AuthContextProvider;
