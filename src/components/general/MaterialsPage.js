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
import {Colors} from 'react-native/Libraries/NewAppScreen';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import IconLib from '../../../assets/books.svg';
import IconGoBack from '../../../assets/goback.svg';
import IconRemove from '../../../assets/x-circle.svg';
import IconDelete from '../../../assets/trash.svg';

const MaterialsPage = ({currentFolder}) => {
  const history = useHistory();
  const [materials, setMaterials] = useState([]);
  const [refresh, setRefresh] = useState(true);
  useEffect(() => {
    if (refresh) {
      RNFS.readDir(currentFolder.path)
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

  const handleDeleteFile = file => {
    const filePath = file.path;

    Alert.alert('Are you sure?', `Delete ${file.name}`, [
      {
        text: 'Yes',
        onPress: () => {
          return RNFS.unlink(filePath)
            .then(() => {
              setRefresh(true);
            })
            .catch(err => {
              alert(err.message);
            });
        },
      },
      {
        text: 'No',
        onPress: () => {
          true;
        },
      },
    ]);
  };
  return (
    <>
      <View style={styles.headerContainer}>
        <IconLib height={40} width={40} color={Colors.black} />
        <Text style={styles.headerText}>Library</Text>
        <TouchableOpacity onPress={() => history.push('/')} style={styles.back}>
          <IconGoBack height={30} width={30} style={styles.goback} />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={styles.subtitleContainer}>
          <Text style={styles.itemSubtitle}>{currentFolder.name}</Text>
        </View>

        {materials.map((item, index) => {
          return (
            <View key={index} style={styles.item}>
              <TouchableOpacity
                style={[
                  styles.itemText,
                  true ? {width: '85%'} : {width: '100%'},
                ]}
                onPress={() => handleOpenFile(item.path, item.name)}>
                <Text style={{textAlign: 'center'}}>{item.name}</Text>
              </TouchableOpacity>
              {true && (
                <TouchableOpacity
                  style={styles.deleteIconContainer}
                  onPress={() => handleDeleteFile(item)}>
                  <IconDelete height={30} width={30} color={'red'} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    paddingHorizontal: 10,
    margin: 5,
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
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    paddingHorizontal: 10,
    minHeight: 70,
    flexDirection: 'row',
  },
  itemText: {
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

export default MaterialsPage;
