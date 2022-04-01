import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  BackHandler,
  Alert,
  ToastAndroid,
  TextInput,
} from 'react-native';
import RNFS from 'react-native-fs';
import Nav from './Nav';
import IconLib from '../../../assets/books.svg';
import IconGoBack from '../../../assets/goback.svg';
import storage from '@react-native-firebase/storage';
import {useHistory} from 'react-router';
import {AuthContext} from '../../context/AuthContext';
import {ClassContext} from '../../context/ClassContext';

const LibraryPage = ({userInfo, setUserInfo, setStories, dailyTest}) => {
  /***STATES***/
  const {classList, setClassList} = useContext(ClassContext);
  const {user} = useContext(AuthContext);
  let history = useHistory();

  /***HOOKS***/
  useEffect(() => {
    if (!user) {
      // no user;
      history.push('/Login');
      setUserInfo({});
      setClassList([]);
    }
    BackHandler.addEventListener('hardwareBackPress', () => {
      alert('Do you want to leave?', 'Exit?');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);
  if (!userInfo['Pre-test']) {
    for (const i in dailyTest) {
      if (dailyTest[i].id == 'Pre-test') {
        setStories(dailyTest[i]);
        history.push('/Story');
      }
    }
  }
  /***FUNCTIONS***/
  return (
    <>
      <ScrollView style={{backgroundColor: '#ffffff'}}>
        <LibraryHeader />
        {dailyTest.length <= 0 ? (
          <View>
            <Text style={styles.subtitle}>Nothing to show</Text>
          </View>
        ) : (
          dailyTest.map((item, index) => {
            if (item.id == 'Pre-test') return;
            return (
              <TouchableOpacity
                key={index}
                style={styles.item}
                onPress={() => {
                  setStories(item);
                  history.push('/Story');
                }}>
                <Text style={styles.itemText}>{item.id}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Nav />
    </>
  );
};
/***COMPONENTS***/
const LibraryHeader = () => {
  return (
    <View style={styles.libraryHeader}>
      <View style={styles.libraryIconContainer}>
        <IconLib height={40} width={40} style={styles.libraryIcon} />
        <Text style={styles.headerText}>Library</Text>
      </View>
    </View>
  );
};

/***STYLES***/
const styles = StyleSheet.create({
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    margin: 5,
    paddingHorizontal: 10,
    height: 80,
  },
  libraryIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  libraryIcon: {
    color: 'black',
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
  },
  searchBar: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    marginLeft: 10,
  },
  searchBarContainer: {
    width: '90%',
    marginTop: 5,
    marginBottom: 20,
    backgroundColor: '#E8EAED',
    borderRadius: 50,
    padding: 5,
    alignSelf: 'center',
  },
  item: {
    height: 60,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: '#ADD8E6',
    fontFamily: 'Lato-Regular',
    flexDirection: 'row',
    alignItems: 'center', //vertical align text center
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: 'Lato-Regular',
    marginTop: 5,
    marginRight: 5,
    color: '#000',
    fontSize: 12,
    textAlign: 'center',
  },
  back: {
    borderRadius: 50,
    backgroundColor: '#fff',
    height: 40,
    width: 40,
    justifyContent: 'center', //Centered horizontally
  },
  goback: {
    color: '#ADD8E6',
    borderRadius: 50,
    alignSelf: 'center',
  },
  itemText: {
    padding: 5,
    fontFamily: 'Lato-Regular',
  },
});

const alert = (msg, title) => {
  if (title == 'Exit?') {
    Alert.alert(title, msg, [
      {text: 'Yes', onPress: () => BackHandler.exitApp()},
      {
        text: 'No',
        onPress: () => {
          true;
        },
      },
    ]);
  } else {
    Alert.alert(title, msg, [{text: 'OK', onPress: () => true}]);
  }
};

export default LibraryPage;
