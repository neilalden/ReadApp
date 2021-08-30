import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  BackHandler,
  Alert,
} from 'react-native';
import {useHistory} from 'react-router';
import IconLib from '../../assets/books.svg';
import IconGoBack from '../../assets/goback.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';

const Materials = ({subjects, subjectNumber}) => {
  const history = useHistory();
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
      <View style={styles.headerContainer}>
        <IconLib height={40} width={40} color={Colors.black} />
        <Text style={styles.headerText}>Library</Text>
        <TouchableOpacity onPress={() => history.push('/')}>
          <IconGoBack height={25} width={40} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.subtitleContainer}>
          <Text style={styles.itemSubtitle}>
            {subjects[subjectNumber].subject}
          </Text>
        </View>
        {subjects[subjectNumber].materials.map((item, index) => {
          return (
            <TouchableOpacity
              style={styles.item}
              key={index}
              onPress={() => {
                openFile(item);
              }}>
              <Text>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
};
const alert = (title = 'Error', msg) =>
  Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => true},
  ]);

const openFile = file => {
  const dest = `${RNFS.DocumentDirectoryPath}/${file}`;
  RNFS.copyFileAssets(file, dest)
    .then(() => FileViewer.open(dest))
    .then(() => {})
    .catch(error => {
      alert("Can't open file", error);
    });
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ADD8E6',
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
  itemSubtitle: {
    color: '#ededed',
    textAlign: 'center',
    fontFamily: 'Lato-Regular',
    fontSize: 18,
    padding: 15,
  },
  subtitleContainer: {
    backgroundColor: '#3d3d3d',
    justifyContent: 'center',
    width: 'auto',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
});

export default Materials;
