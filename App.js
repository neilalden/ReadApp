/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
//  import DocumentPicker from 'react-native-document-picker';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import {NativeRouter, Route, Link} from 'react-router-native';
import Library from './src/components/Library';
import Classes from './src/components/Classes';

const App = () => {
  // const [files, setFiles] = useState([]);
  // useEffect(() => {
  //   RNFS.readdir(RNFS.DocumentDirectoryPath)
  //     .then(res => {
  //       console.log(res);
  //       for (let i in res) {
  //         if (res[i] != 'ReactNativeDevBundle.js') {
  //           setFiles(data => [...data, res[i]]);
  //           console.log(res[i]);
  //         }
  //       }
  //     })
  //     .catch(e => {
  //       console.log(e);
  //     });
  // }, []);
  return (
    <NativeRouter>
      <View style={styles.header}>
        <Link to="/" underlayColor="#f0f4f7">
          <Text style={styles.headerText}>Library</Text>
        </Link>
        <Link to="/Classes" underlayColor="#f0f4f7">
          <Text style={styles.headerText}>Clasess</Text>
        </Link>
      </View>
      <Route exact path="/" component={Library} />
      <Route path="/Classes" component={Classes} />
    </NativeRouter>
  );
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
export default App;
