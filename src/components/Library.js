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

const Library = () => {
  const [files, setFiles] = useState(['Module 2.docx', 'Spanning tree.pptx']);

  BackHandler.addEventListener('hardwareBackPress', function () {
    alert('Close app', 'Are you sure you want to leave Read App?');
  });

  return (
    <>
      <ScrollView>
        {files.map((item, index) => {
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
      console.log(error);
    });
};

const styles = StyleSheet.create({
  body: {},
  header: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginHorizontal: 30,
    marginVertical: 10,
  },
  materialContainer: {},
  item: {
    backgroundColor: '#E8EAED',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'monospace',
    marginHorizontal: 10,
    marginVertical: 3,
  },
});

export default Library;
