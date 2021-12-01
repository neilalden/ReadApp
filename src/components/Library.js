import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  BackHandler,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import Nav from './Nav';
import IconGoBack from '../../assets/goback.svg';
import IconGear from '../../assets/gear.svg';
import {useHistory} from 'react-router';
import RNFS from 'react-native-fs';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import IconRemove from '../../assets/x-circle.svg';
import Jumbotron1 from '../../assets/library_svgs/undraw_reading_time_gvg0.svg';
import Jumbotron2 from '../../assets/library_svgs/undraw_absorbed_in_xahs.svg';
import Jumbotron3 from '../../assets/library_svgs/undraw_Bibliophile_re_xarc.svg';
import Jumbotron4 from '../../assets/library_svgs/undraw_book_reading_kx9s.svg';
import Jumbotron5 from '../../assets/library_svgs/undraw_Bookshelves_re_lxoy.svg';
import Jumbotron6 from '../../assets/library_svgs/undraw_mathematics_4otb.svg';
import Jumbotron7 from '../../assets/library_svgs/undraw_studying_s3l7.svg';
import Jumbotron8 from '../../assets/class_list_svgs/undraw_teaching_f1cm.svg';
import Jumbotron9 from '../../assets/class_list_svgs/undraw_exams_g4ow.svg';
import Jumbotron10 from '../../assets/class_list_svgs/undraw_Online_learning_re_qw08.svg';
import Jumbotron11 from '../../assets/class_list_svgs/undraw_tutorial_video_vtd1.svg';
import Jumbotron12 from '../../assets/class_list_svgs/undraw_teacher_35j2.svg';
import Jumbotron13 from '../../assets/class_list_svgs/undraw_researching_22gp.svg';
import Jumbotron14 from '../../assets/class_list_svgs/undraw_professor_8lrt.svg';
import Jumbotron15 from '../../assets/class_list_svgs/undraw_quiz_nlyh.svg';
import Jumbotron16 from '../../assets/library_svgs/undraw_reading_re_29f8.svg';

const Library = ({subjects, setSubjects, setCurrSubj, libSvgRandNum}) => {
  const history = useHistory();
  const [showSettings, setShowSettings] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [toDL, setToDL] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refresh, setRefresh] = useState(true);

  useEffect(() => {
    if (subjects.length === 0) {
      fetchFiles();
    }
    if (showSettings && materials.length === 0) {
      downloadMaterials();
    }

    BackHandler.addEventListener('hardwareBackPress', () => {
      alert('Do you want to leave?', 'Exit');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [showSettings]);

  const componentsMap = {
    Jumbotron1,
    Jumbotron2,
    Jumbotron3,
    Jumbotron4,
    Jumbotron5,
    Jumbotron6,
    Jumbotron7,
    Jumbotron8,
    Jumbotron9,
    Jumbotron10,
    Jumbotron11,
    Jumbotron12,
    Jumbotron13,
    Jumbotron14,
    Jumbotron16,
  };
  const componentName = 'Jumbotron' + libSvgRandNum;
  const DynamicComponent = componentsMap[componentName];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFiles();
    wait(1000).then(() => setRefreshing(false));
  }, []);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };

  //
  const handleDeleteFolder = (filePath, fileName, setRefresh) => {
    return RNFS.unlink(filePath)
      .then(() => {
        if (subjects.length == 1) {
          setSubjects([]);
        } else {
          onRefresh();
        }
      })
      .catch(err => {
        alert(err.message);
      });
  };

  const handleDownloadFiles = (year, subjects) => {
    let refs = [];
    for (let i in subjects) {
      for (let j in subjects[i].files) {
        refs.push(
          `Materials/${year}/${subjects[i].subject}/${subjects[i].files[j]}`,
        );
      }
    }
    setToDL(refs);
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
              // success
              fetchFiles();
              if (toDL.length == 0) setShowSettings(false);
              let copyToDL = [...refs];
              copyToDL.pop();
              setToDL(copyToDL);
            })
            .catch(error => {
              alert(error);
            });
        })
        .catch(e => alert(e));
    }
  };

  const downloadMaterials = () => {
    firestore()
      .collection(`materials`)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          let material = {
            year: doc.id,
            subjects: [],
          };
          Object.keys(doc.data()).forEach(subject => {
            const subjectObject = {subject, files: doc.data()[subject]};
            material.subjects.push(subjectObject);
          });
          setMaterials(prev => [...prev, material]);
        });
      })
      .catch(e => alert(e.message));
  };

  const fetchFiles = () => {
    RNFS.readDir(RNFS.ExternalDirectoryPath)
      .then(res => {
        if (res.length !== 0) {
          setSubjects(res);
        }
      })
      .catch(e => alert(e.message));
  };

  return (
    <>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.classHeader}>
          <View style={{marginTop: 0}}>
            <View style={styles.iconLogin}>
              <DynamicComponent height={200} width={400} />
            </View>
          </View>
        </View>
        <View style={{backgroundColor: '#ADD8E6'}}>
          <View style={styles.backgroundView}>
            <TouchableOpacity
              style={{
                margin: 5,
                padding: 10,
              }}
              onPress={() => setShowSettings(!showSettings)}>
              {showSettings ? (
                <IconGoBack height={20} width={20} color={Colors.black} />
              ) : (
                <IconGear
                  height={20}
                  width={20}
                  color={Colors.black}
                  style={{}}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {showSettings ? (
          <ScrollView>
            {materials.length === 0 ? (
              <Text style={styles.subtitle}>Loading...</Text>
            ) : toDL.length > 0 ? (
              <>
                <Text style={styles.subtitle}>
                  Please don't close the app. {toDL.length} materials left to
                  download
                </Text>
              </>
            ) : (
              <ScrollView>
                <Text style={styles.header}>
                  Select your grade level and wait for the downloads to finish
                </Text>
                {materials.map((item, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.item,
                        {
                          paddingVertical: 20,
                          justifyContent: 'center',
                        },
                      ]}
                      onPress={() => {
                        handleDownloadFiles(item.year, item.subjects);
                      }}>
                      <Text>{item.year}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </ScrollView>
        ) : (
          <ScrollView
            style={{
              backgroundColor: '#fff',
            }}>
            {subjects.length > 0 ? (
              subjects.map((item, index) => {
                return (
                  <View style={styles.item} key={index}>
                    <TouchableOpacity
                      style={{
                        padding: 15,
                        width: '85%',
                      }}
                      onPress={() => {
                        setCurrSubj(item);
                        history.push('/Materials');
                      }}>
                      <Text>{item.name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        width: '15%',
                      }}
                      onPress={() =>
                        handleDeleteFolder(item.path, item.name, setRefresh)
                      }>
                      <IconRemove height={30} width={30} color={'red'} />
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <Text style={styles.subtitle}>
                Click the gear icon and download some materials
              </Text>
            )}
          </ScrollView>
        )}
      </ScrollView>
      <Nav />
    </>
  );
};

const alert = (msg, title = 'Error') => {
  if (title == 'Exit') {
    Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
      {text: 'Yes', onPress: () => BackHandler.exitApp()},
      {
        text: 'No',
        onPress: () => {
          true;
        },
      },
    ]);
  } else {
    Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
      {text: 'OK', onPress: () => true},
    ]);
  }
};

const styles = StyleSheet.create({
  classHeader: {
    backgroundColor: '#ADD8E6',
    fontFamily: 'Lato-Regular',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
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
    // backgroundColor: '#ADD8E6',
    // fontFamily: 'Lato-Regular',
    // justifyContent: 'center',
    // alignItems: 'center',
    // borderRadius: 10,
    paddingVertical: 10,
    marginHorizontal: 10,
    marginVertical: 3,
    borderRadius: 10,
    backgroundColor: '#ADD8E6',
    justifyContent: 'space-between',
    fontFamily: 'Lato-Regular',
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
    color: '#ccc',
  },
  backgroundView: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    justifyContent: 'flex-end',
  },
  iconLogin: {
    alignSelf: 'center',
  },
});

export default Library;
