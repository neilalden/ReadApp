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

import {useHistory} from 'react-router';

const LibraryPage = ({topics, setCurrentFolder}) => {
  /***STATES***/
  let history = useHistory();
  const [refreshing, setRefreshing] = useState(false);
  const [topicsCopy, setTopicsCopy] = useState([...topics]);

  /***HOOKS***/
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      alert('Do you want to leave?', 'Exit?');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    wait(1000).then(() => setRefreshing(false));
  }, []);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };

  /***FUNCTIONS***/
  return (
    <>
      <ScrollView
        style={{backgroundColor: '#ffffff'}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <LibraryHeader />
        <SearchComponent topics={topics} setTopicsCopy={setTopicsCopy} />
        <MaterialsFolderList
          setCurrentFolder={setCurrentFolder}
          topicsCopy={topicsCopy}
          history={history}
        />
      </ScrollView>

      <Nav />
    </>
  );
};
/***COMPONENTS***/

const LibraryHeader = () => {
  return (
    <View style={styles.libraryHeader}>
      <IconLib height={40} width={40} style={styles.libraryIcon} />
      <Text style={styles.headerText}>Library</Text>
      <View width={25} />
    </View>
  );
};

const SearchComponent = ({topics, setTopicsCopy}) => {
  return (
    <View style={styles.searchBarContainer}>
      <TextInput
        style={styles.searchBar}
        placeholder="Look for a subject or a file &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 🔎"
        onChangeText={text => {
          text = text.toLowerCase();
          if (text === '') {
            setTopicsCopy(topics);
            return;
          }
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
                <Text>{topic.name}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    margin: 5,
    height: 80,
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
  },
  searchBarContainer: {
    width: '80%',
    marginTop: 5,
    marginBottom: 20,
    backgroundColor: '#E8EAED',
    borderRadius: 10,
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
