import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';

const Library = () => {
  const [files, setFiles] = useState([]);
  useEffect(() => {
    RNFS.readdir(RNFS.DocumentDirectoryPath)
      .then(res => {
        setFiles([]);
        for (let i in res) {
          if (res[i] != 'ReactNativeDevBundle.js') {
            setFiles(data => [...data, res[i]]);
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  }, []);
  return (
    <View>
      <View style={styles.materialContainer}>
        {files.map((item, index) => {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                openFile('CHAP12.docx');
              }}>
              <Text style={styles.item}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

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
    marginTop: 5,
  },
});

export default Library;
