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
} from 'react-native';
import {useHistory} from 'react-router';
import IconLib from '../../assets/books.svg';
import IconGoBack from '../../assets/goback.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import IconRemove from '../../assets/x-circle.svg';

const Materials = ({currSubj}) => {
  const history = useHistory();
  const [materials, setMaterials] = useState([]);
  const [refresh, setRefresh] = useState(true);
  useEffect(() => {
    if (refresh) {
      RNFS.readDir(currSubj.path)
        .then(res => {
          setMaterials(res);
          setRefresh(false);
        })
        .catch(e => alert(e.message));
    }
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [refresh]);
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
          <Text style={styles.itemSubtitle}>{currSubj.name}</Text>
        </View>

        {materials.map((item, index) => {
          return (
            <View key={index} style={styles.item}>
              <TouchableOpacity
                style={styles.itemText}
                onPress={() => handleOpenFile(item.path, item.name)}>
                <Text>{item.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: '20%',
                  padding: 20,
                }}
                onPress={() =>
                  handleDeleteFile(item.path, item.name, setRefresh)
                }>
                <IconRemove height={30} width={30} color={'red'} />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </>
  );
};

const handleDeleteFile = (filePath, fileName, setRefresh) => {
  return RNFS.unlink(filePath)
    .then(() => {
      setRefresh(true);
    })
    .catch(err => {
      alert(err.message);
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
  RNFS.copyFile(filePath, dest)
    .then(() => FileViewer.open(dest))
    .catch(e => alert(e));
};

const alert = (msg, title = 'Error') =>
  Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => true},
  ]);

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
    justifyContent: 'space-between',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 3,
    flexDirection: 'row',
  },
  itemText: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
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
