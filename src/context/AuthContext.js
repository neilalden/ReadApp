import React, {useState, createContext, useEffect} from 'react';
import {Alert} from 'react-native';
import {useHistory} from 'react-router-native';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    // secure this with an env file or something
    '675697621447-hnqborisfr948gm59iddbfjo707ff0ek.apps.googleusercontent.com',
});

export const AuthContext = createContext();

const AuthContextProvider = props => {
  const [user, setUser] = useState({});
  const [reload, setReload] = useState(false);
  const history = useHistory();
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, [reload]);

  const onAuthStateChanged = user => {
    setUser(user);
    history.push('/');
  };

  return (
    <AuthContext.Provider value={{user, setUser, setReload}}>
      {props.children}
    </AuthContext.Provider>
  );
};

export async function onGoogleButtonPress() {
  try {
    const {idToken} = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    return auth().signInWithCredential(googleCredential);
  } catch (e) {
    alert(`${e}`);
  }
}
export const signOut = () => {
  auth()
    .signOut()
    .then(async function () {
      await GoogleSignin.revokeAccess();
    })
    .catch(err => alert(`${err}`));
};

const alert = (msg, title = 'Alert') => {
  Alert.alert(`${title ? title : 'Alert'}`, `${msg ? msg : ''}`, [
    {text: 'OK', onPress: () => true},
  ]);
};
export default AuthContextProvider;
