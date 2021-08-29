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
      <View style={styles.subtitleContainer}>
        <Text style={styles.itemSubtitle}>
          {subjects[subjectNumber].subject}
        </Text>
      </View>
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
  itemSubtitle: {
    fontSize: 18,
    fontFamily: 'Lato-Regular',
    padding: 15,
    textAlign: 'center',
    color: '#ededed',
  },
  subtitleContainer: {
    backgroundColor: '#3d3d3d',
    width: 'auto',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
});

export default Materials;
