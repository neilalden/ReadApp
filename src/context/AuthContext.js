import auth from '@react-native-firebase/auth';
import React, {useState, createContext, useEffect} from 'react';

export const AuthContext = createContext();
export const signInWithPhoneNumber = (
  phoneNumber,
  setConfirm,
  createTwoButtonAlert,
  setIsLoading,
) => {
  if (phoneNumber) {
    auth()
      .signInWithPhoneNumber(phoneNumber)
      .then(confirmation => {
        setConfirm(confirmation);
      })
      .catch(e => {
        setIsLoading(false);
        createTwoButtonAlert(e);
        console.log(e);
      });
  } else {
    setIsLoading(false);
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

const AuthContextProvider = props => {
  const [user, setUser] = useState({});
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const onAuthStateChanged = user => {
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{user, setUser}}>
      {props.children}
    </AuthContext.Provider>
  );
};
export default AuthContextProvider;
