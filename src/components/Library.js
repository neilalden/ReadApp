import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  BackHandler,
  Alert,
} from 'react-native';
import Nav from './Nav';
import IconLib from '../../assets/books.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useHistory} from 'react-router';

const Library = ({subjects, subjectNumber, setSubjectNumber}) => {
  // const [files, setFiles] = useState(['Module 2.docx', 'Spanning tree.pptx']);
  const history = useHistory();
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      alert('Exit', 'Do you want to leave?');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  return (
    <>
      <View style={styles.header}>
        <IconLib height={40} width={40} color={Colors.black} />
        <Text style={styles.headerText}>Library</Text>
      </View>
      <ScrollView>
        {subjects.map((item, index) => {
          return (
            <TouchableOpacity
              style={styles.item}
              key={index}
              onPress={() => {
                setSubjectNumber(index);
                history.push('/Materials');
              }}>
              <Text style={styles.item}>{item.subject}</Text>
            </TouchableOpacity>
          );
        })}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ADD8E6',
    borderRadius: 5,
    margin: 10,
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
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 3,
    textAlign: 'center',
    width: '95%',
  },
});

export default Library;
