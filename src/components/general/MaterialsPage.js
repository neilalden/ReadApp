import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  BackHandler,
  Alert,
  ToastAndroid,
  TextInput,
} from 'react-native';
import {useHistory} from 'react-router';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import IconLib from '../../../assets/books.svg';
import IconGoBack from '../../../assets/goback.svg';

const MaterialsPage = ({currentFolder}) => {
  const history = useHistory();
  const [filesCopy, setFilesCopy] = useState([...currentFolder.files]);
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  return (
    <>
      <LibraryHeader history={history} currentFolder={currentFolder} />
      <SearchComponent
        filesCopy={filesCopy}
        setFilesCopy={setFilesCopy}
        files={currentFolder.files}
      />
      <ScrollView>
        {filesCopy.length > 0 ? (
          filesCopy.map((file, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={styles.item}
                onPress={() => openFile(file, currentFolder.name)}>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemText}>{file.name}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.subtitle}>No files found</Text>
        )}
      </ScrollView>
    </>
  );
};
const LibraryHeader = ({history, currentFolder}) => {
  return (
    <View style={styles.libraryHeader}>
      {currentFolder.name.length < 25 && <View width={25} />}
      <View style={styles.libraryIconContainer}>
        <IconLib height={40} width={40} style={styles.libraryIcon} />
        <Text
          style={[
            styles.headerText,
            currentFolder.name.length > 25 && {fontSize: 14},
          ]}>
          {currentFolder.name}
        </Text>
      </View>
      <TouchableOpacity onPress={() => history.push('/')} style={styles.back}>
        <IconGoBack height={30} width={30} style={styles.goback} />
      </TouchableOpacity>
    </View>
  );
};

const SearchComponent = ({filesCopy, setFilesCopy, files}) => {
  return (
    <View style={styles.searchBarContainer}>
      <TextInput
        style={styles.searchBar}
        placeholder="Look for a file &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 🔎"
        onChangeText={text => {
          text = text.toLowerCase();
          if (text === '') {
            setFilesCopy(files);
            return;
          }
          setFilesCopy(files);
          setFilesCopy(prev =>
            prev.filter(file => {
              return file.toLowerCase().includes(text);
            }),
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    margin: 5,
    paddingHorizontal: 10,
    height: 80,
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
  },
  libraryIcon: {
    color: 'black',
  },
  libraryIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#ADD8E6',
    fontFamily: 'Lato-Regular',
    justifyContent: 'center',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    paddingHorizontal: 10,
    minHeight: 70,
    flexDirection: 'row',
  },
  itemTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    padding: 5,
    fontFamily: 'Lato-Regular',
  },
  header2: {
    color: '#ededed',
    textAlign: 'center',
    fontFamily: 'Lato-Regular',
    fontSize: 18,
    padding: 15,
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
  deleteIconContainer: {
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 50,
    padding: 7,
    marginLeft: 10,
  },
});
const openFile = (file, folder) => {
  if (file.isDownloaded) {
    // const path = filePath.replace(file.name, '');
    const dest = `${RNFS.DocumentDirectoryPath}/${file.name}`;
    RNFS.copyFile(`${RNFS.ExternalDirectoryPath}/${folder}/${file.name}`, dest)
      .then(() => FileViewer.open(dest))
      .catch(e => alert(e));
    return;
  }
  const dest = `${RNFS.DocumentDirectoryPath}/${file.name}`;
  RNFS.copyFileAssets(file.name, dest)
    .then(() => FileViewer.open(dest))
    .catch(error => {
      alert(error.message, "Can't open file");
    });
};

const handleOpenFile = (filePath, fileName) => {
  ToastAndroid.showWithGravity(
    'Loading...',
    ToastAndroid.SHORT,
    ToastAndroid.CENTER,
  );
  const path = filePath.replace(fileName, '');
  const dest = `${RNFS.DocumentDirectoryPath}/${fileName}`;
  RNFS.copyFileAssets(filePath, dest)
    .then(() => FileViewer.open(dest))
    .then(() => {})
    .catch(e => alert(e));
};

const alert = (msg, title = 'Error') =>
  Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => true},
  ]);

export default MaterialsPage;
