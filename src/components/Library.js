import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  BackHandler,
  Alert,
  TextInput,
} from 'react-native';
import Nav from './Nav';
import IconLib from '../../assets/undraw_reading_time_gvg0.svg';
import {useHistory} from 'react-router';

const Library = ({subjects, setSubjectName}) => {
  const history = useHistory();
  const [copySubjects, setCopySubjects] = useState([]);
  useEffect(() => {
    setCopySubjects(subjects);
    BackHandler.addEventListener('hardwareBackPress', () => {
      alert('Exit', 'Do you want to leave?');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  return (
    <>
      <ScrollView>
        <View style={styles.classHeader}>
          <View style={{marginTop: 0}}>
            <View style={styles.iconLogin}>
              <IconLib height={200} width={400} />
            </View>
          </View>
        </View>
        <View style={{backgroundColor: '#ADD8E6'}}>
          <View style={styles.backgroundView}>
            <TextInput
              placeholder="Look for a subject 🔎"
              style={styles.searchBar}
              onChangeText={text => {
                text = text.toLowerCase();
                if (text == '') {
                  setCopySubjects(subjects);
                  return;
                }
                setCopySubjects(subjects);
                setCopySubjects(prev =>
                  prev.filter(subj =>
                    subj.subject.toLowerCase().includes(text),
                  ),
                );
              }}
            />
          </View>
        </View>
        <ScrollView
          style={{
            backgroundColor: '#fff',
          }}>
          {copySubjects.map((item, index) => {
            return (
              <TouchableOpacity
                style={styles.item}
                key={index}
                onPress={() => {
                  setSubjectName(item.subject);
                  history.push('/Materials');
                }}>
                <Text>{item.subject}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ScrollView>
      <Nav />
    </>
  );
};

const alert = (title = 'Error', msg) => {
  if (title == 'Exit') {
    Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
      {text: 'Yes', onPress: () => BackHandler.exitApp()},
      {
        text: 'No',
        onPress: () => {
          true;
        },
      },
    ]);
  } else {
    Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
      {text: 'OK', onPress: () => true},
    ]);
  }
};

const styles = StyleSheet.create({
  searchBar: {
    marginVertical: 0,
    marginLeft: 20,
    width: '90%',
  },
  classHeader: {
    backgroundColor: '#ADD8E6',
    fontFamily: 'Lato-Regular',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  headerText: {
    padding: 10,
    fontSize: 20,
    fontFamily: 'Lato-Regular',
    marginHorizontal: 30,
    marginVertical: 10,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#ADD8E6',
    fontFamily: 'Lato-Regular',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 20,
    marginHorizontal: 10,
    marginVertical: 3,
  },
  backgroundView: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  iconLogin: {
    alignSelf: 'center',
  },
});

export default Library;
