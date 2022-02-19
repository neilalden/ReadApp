import React, {useCallback, useEffect, useState} from 'react';
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
import IconDownload from '../../../assets/download.svg';
import IconGoBack from '../../../assets/goback.svg';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import {useHistory} from 'react-router';

const LibraryPage = ({topics, setCurrentFolder}) => {
  /***STATES***/
  let history = useHistory();
  const [refreshing, setRefreshing] = useState(false);
  const [topicsCopy, setTopicsCopy] = useState([...topics]);
  const [downloadableMaterialsCopy, setDownloadableMaterialsCopy] = useState(
    [],
  );
  const [downloadableMaterials, setDownloadableMaterials] = useState([]);
  const [showDownloadableMaterials, setShowDownloadableMaterials] =
    useState(false);
  const [text, setText] = useState('');

  /***HOOKS***/
  useEffect(() => {
    if (showDownloadableMaterials && downloadableMaterials.length === 0) {
      fetchDownloadableMaterials();
    } else if (showDownloadableMaterials && downloadableMaterials.length > 0) {
      setDownloadableMaterialsCopy(downloadableMaterials);
    } else if (!showDownloadableMaterials) {
      setTopicsCopy(topics);
    }
    BackHandler.addEventListener('hardwareBackPress', () => {
      alert('Do you want to leave?', 'Exit?');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [showDownloadableMaterials]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    wait(1000).then(() => setRefreshing(false));
  }, []);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };

  /***FUNCTIONS***/
  const fetchDownloadableMaterials = () => {
    firestore()
      .collection(`materials`)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          let material = {
            subject: doc.id,
            files: [],
          };
          Object.keys(doc.data()).forEach(subject => {
            const subjectObject = {subject, files: doc.data()[subject]};
            material.files = subjectObject.files;
          });
          setDownloadableMaterials(prev => [...prev, material]);
          setDownloadableMaterialsCopy(prev => [...prev, material]);
        });
      })
      .catch(e => alert(e.message));
  };

  const downloadFiles = item => {
    let refs = [];
    for (let i in item.files) {
      refs.push(`materials/${item.subject}/${item.files[i]}`);
    }
    for (let i in refs) {
      const filePath = refs[i];
      storage()
        .ref(filePath)
        .getDownloadURL()
        .then(url => {
          const ref = refs[i].split('/');
          const options = {
            fromUrl: url,
            toFile: `${RNFS.ExternalDirectoryPath}/${ref[ref.length - 2]}/${
              ref[ref.length - 1]
            }`,
          };

          RNFS.mkdir(`${RNFS.ExternalDirectoryPath}/${ref[ref.length - 2]}`);
          RNFS.downloadFile(options)
            .promise.then(() => {
              ToastAndroid.show('Download complete!', ToastAndroid.SHORT);
              setShowDownloadableMaterials(false);
            })
            .catch(e => {
              alert(e.message);
            });
        })
        .catch(e => alert(e.message, e.code));
    }
  };

  return (
    <>
      <ScrollView
        style={{backgroundColor: '#ffffff'}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <LibraryHeader
          setText={setText}
          setShowDownloadableMaterials={setShowDownloadableMaterials}
          showDownloadableMaterials={showDownloadableMaterials}
        />
        <SearchComponent
          text={text}
          setText={setText}
          topics={topics}
          setTopicsCopy={setTopicsCopy}
          showDownloadableMaterials={showDownloadableMaterials}
          downloadableMaterials={downloadableMaterials}
          setDownloadableMaterialsCopy={setDownloadableMaterialsCopy}
        />
        {showDownloadableMaterials ? (
          <DownloadableMaterialsList
            downloadFiles={downloadFiles}
            downloadableMaterialsCopy={downloadableMaterialsCopy}
          />
        ) : (
          <MaterialsFolderList
            setCurrentFolder={setCurrentFolder}
            topicsCopy={topicsCopy}
            history={history}
          />
        )}
      </ScrollView>

      <Nav />
    </>
  );
};
/***COMPONENTS***/

const DownloadableMaterialsList = ({
  downloadFiles,
  downloadableMaterialsCopy,
}) => {
  return (
    <ScrollView>
      <Text style={styles.headerText}>Click to download</Text>
      {downloadableMaterialsCopy.length > 0 ? (
        downloadableMaterialsCopy.map((item, index) => {
          return (
            <View key={index}>
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  ToastAndroid.show('Downloading...', ToastAndroid.LONG);
                  downloadFiles(item);
                }}>
                <Text>{item.subject}</Text>
              </TouchableOpacity>
            </View>
          );
        })
      ) : (
        <Text style={styles.subtitle}>No Materials</Text>
      )}
    </ScrollView>
  );
};

const LibraryHeader = ({
  showDownloadableMaterials,
  setShowDownloadableMaterials,
  setText,
}) => {
  return (
    <View style={styles.libraryHeader}>
      <View width={25} />
      <View style={styles.libraryIconContainer}>
        <IconLib height={40} width={40} style={styles.libraryIcon} />
        <Text style={styles.headerText}>Library</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          setText('');
          setShowDownloadableMaterials(prev => !prev);
        }}
        style={styles.back}>
        {showDownloadableMaterials ? (
          <IconGoBack height={30} width={30} style={styles.goback} />
        ) : (
          <IconDownload height={25} width={25} style={styles.goback} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const SearchComponent = ({
  text,
  setText,
  topics,
  setTopicsCopy,
  showDownloadableMaterials,
  downloadableMaterials,
  setDownloadableMaterialsCopy,
}) => {
  return (
    <View style={styles.searchBarContainer}>
      <TextInput
        style={styles.searchBar}
        placeholder="Look for a subject or a file &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 🔎"
        value={text}
        onChangeText={text => {
          setText(text);
          text = text.toLowerCase();
          if (text === '') {
            if (showDownloadableMaterials) {
              setDownloadableMaterialsCopy(downloadableMaterials);
            } else {
              setTopicsCopy(topics);
            }
            return;
          }
          if (showDownloadableMaterials) {
            setDownloadableMaterialsCopy(downloadableMaterials);
            setDownloadableMaterialsCopy(prev =>
              prev.filter(topic => {
                return topic.subject.toLowerCase().includes(text);
              }),
            );
          } else {
            setTopicsCopy(topics);
            setTopicsCopy(prev =>
              prev.filter(topic => {
                let isTrue = topic.name.toLowerCase().includes(text);
                if (isTrue === false) {
                  for (let i in topic.files) {
                    if (topic.files[i].toLowerCase().includes(text)) {
                      return true;
                    }
                  }
                }
                return isTrue;
              }),
            );
          }
        }}
      />
    </View>
  );
};

const MaterialsFolderList = ({setCurrentFolder, history, topicsCopy}) => {
  const openFolder = item => {
    setCurrentFolder(item);

    history.push('/Materials');
  };
  return (
    <ScrollView>
      {topicsCopy.length > 0 ? (
        topicsCopy.map((topic, index) => {
          return (
            <View key={index}>
              <TouchableOpacity
                style={styles.item}
                onPress={() => openFolder(topic)}>
                <Text style={styles.itemText}>{topic.name}</Text>
              </TouchableOpacity>
            </View>
          );
        })
      ) : (
        <Text style={styles.subtitle}>No subject of files found</Text>
      )}
    </ScrollView>
  );
};

/***STYLES***/
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
