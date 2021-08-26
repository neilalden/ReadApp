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
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import Nav from './Nav';
import IconLib from '../../assets/books.svg';
import IconGoBack from '../../assets/goback.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const Library = () => {
  // const [files, setFiles] = useState(['Module 2.docx', 'Spanning tree.pptx']);
  const [subjects, setSubjects] = useState([
    {
      subject: 'Advance machine learning',
      materials: ['Module 1.pdf', 'Module 2.docx'],
    },
    {
      subject: 'Algorithms and complexity',
      materials: ['Spanning tree.pptx'],
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [subjectNumber, setSubjectNumber] = useState(0);
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (isOpen) {
        setIsOpen(false);
      }
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  return (
    <>
      <View style={styles.header}>
        <IconLib height={40} width={40} color={Colors.black} />
        <Text style={styles.headerText}>Library</Text>
        {isOpen ? (
          <TouchableOpacity onPress={() => setIsOpen(false)}>
            <IconGoBack height={25} width={40} color={Colors.black} />
          </TouchableOpacity>
        ) : (
          <></>
        )}
      </View>
      {!isOpen ? (
        <ScrollView>
          {subjects.map((item, index) => {
            return (
              <TouchableOpacity
                style={styles.item}
                key={index}
                onPress={() => {
                  setIsOpen(true);
                  setSubjectNumber(index);
                }}>
                <Text style={styles.item}>{item.subject}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView>
          {subjects[subjectNumber].materials.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  openFile(item);
                }}>
                <Text style={styles.item}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
      <Nav />
    </>
  );
};

const alert = (title = 'Error', msg) =>
  Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => console.log('OK Pressed')},
  ]);

const openFile = file => {
  const dest = `${RNFS.DocumentDirectoryPath}/${file}`;
  RNFS.copyFileAssets(file, dest)
    .then(() => FileViewer.open(dest))
    .then(() => {
      console.log('file openned');
    })
    .catch(error => {
      alert("Can't open file", error);
    });
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
