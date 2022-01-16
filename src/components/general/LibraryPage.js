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
} from 'react-native';
import RNFS from 'react-native-fs';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Nav from './Nav';

import ImageHeader1 from '../../../assets/image_headers/undraw_reading_time_gvg0.svg';
import ImageHeader2 from '../../../assets/image_headers/undraw_absorbed_in_xahs.svg';
import ImageHeader3 from '../../../assets/image_headers/undraw_Bibliophile_re_xarc.svg';
import ImageHeader4 from '../../../assets/image_headers/undraw_book_reading_kx9s.svg';
import ImageHeader5 from '../../../assets/image_headers/undraw_Bookshelves_re_lxoy.svg';
import ImageHeader6 from '../../../assets/image_headers/undraw_mathematics_4otb.svg';
import ImageHeader7 from '../../../assets/image_headers/undraw_studying_s3l7.svg';
import ImageHeader8 from '../../../assets/image_headers/undraw_teaching_f1cm.svg';
import ImageHeader9 from '../../../assets/image_headers/undraw_exams_g4ow.svg';
import ImageHeader10 from '../../../assets/image_headers/undraw_Online_learning_re_qw08.svg';
import ImageHeader11 from '../../../assets/image_headers/undraw_tutorial_video_vtd1.svg';
import ImageHeader12 from '../../../assets/image_headers/undraw_teacher_35j2.svg';
import ImageHeader13 from '../../../assets/image_headers/undraw_researching_22gp.svg';
import ImageHeader14 from '../../../assets/image_headers/undraw_professor_8lrt.svg';
import ImageHeader15 from '../../../assets/image_headers/undraw_quiz_nlyh.svg';
import ImageHeader16 from '../../../assets/image_headers/undraw_reading_re_29f8.svg';

import IconGoBack from '../../../assets/goback.svg';
import IconGear from '../../../assets/gear.svg';
import IconDelete from '../../../assets/trash.svg';
import IconDownload from '../../../assets/download.svg';

import {useHistory} from 'react-router';

const LibraryPage = ({headerImageRandNum, setCurrentFolder}) => {
  /***STATES***/
  let history = useHistory();
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDownloadableFiles, setShowDownloadableFiles] = useState(false);
  const [showExistingFiles, setShowExistingFiles] = useState(false);
  const [materialsFolder, setMaterialsFolder] = useState([]);
  const [downloadableMaterials, setDownloadableMaterials] = useState([]);
  const [filesToDownload, setFilesToDownload] = useState([]);

  /***HOOKS***/
  useEffect(() => {
    if (materialsFolder.length === 0) {
      fetchFiles();
    }
    if (showDownloadableFiles && downloadableMaterials.length === 0) {
      fetchDownloadableMaterials();
    }

    BackHandler.addEventListener('hardwareBackPress', () => {
      alert('Do you want to leave?', 'Exit?');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [showDownloadableFiles]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFiles();
    wait(1000).then(() => setRefreshing(false));
  }, []);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };

  /***FUNCTIONS***/
  const fetchFiles = () => {
    RNFS.readDir(RNFS.ExternalDirectoryPath)
      .then(res => {
        if (res.length !== 0) {
          setMaterialsFolder(res);
        }
      })
      .catch(e => alert(e.message));
  };

  const fetchDownloadableMaterials = () => {
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
          setDownloadableMaterials(prev => [...prev, material]);
        });
      })
      .catch(e => alert(e.message));
  };

  const downloadFiles = (year, subjects) => {
    let refs = [];
    for (let i in subjects) {
      for (let j in subjects[i].files) {
        refs.push(
          `Materials/${year}/${subjects[i].subject}/${subjects[i].files[j]}`,
        );
      }
    }
    setFilesToDownload(refs);
    for (let i in refs) {
      const filePath = refs[i];
      let copyfilesToDownload = [...filesToDownload];
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
          copyfilesToDownload.pop();
          setFilesToDownload(copyfilesToDownload);

          RNFS.mkdir(`${RNFS.ExternalDirectoryPath}/${ref[ref.length - 2]}`);
          RNFS.downloadFile(options)
            .promise.then(() => {
              // success
              fetchFiles();
              if (filesToDownload.length == 0) setShowSettings(false);
            })
            .catch(e => {
              alert(e.code, e.message);
            });
        })
        .catch(e => alert(e.code, e.message));
    }
  };

  return (
    <>
      <ScrollView
        style={{backgroundColor: '#ffffff'}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <ImageHeader headerImageRandNum={headerImageRandNum} />
        <CurvedSegment
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          setShowDownloadableFiles={setShowDownloadableFiles}
          setShowExistingFiles={setShowExistingFiles}
        />
        {showSettings ? (
          <SettingsContainer
            showDownloadableFiles={showDownloadableFiles}
            setShowDownloadableFiles={setShowDownloadableFiles}
            showExistingFiles={showExistingFiles}
            setShowExistingFiles={setShowExistingFiles}
            downloadableMaterials={downloadableMaterials}
            downloadFiles={downloadFiles}
            filesToDownload={filesToDownload}
          />
        ) : (
          <MaterialsFolderList
            materialsFolder={materialsFolder}
            setCurrentFolder={setCurrentFolder}
            history={history}
          />
        )}
      </ScrollView>
      <Nav />
    </>
  );
};

/***COMPONENTS***/
const ImageHeader = ({headerImageRandNum}) => {
  const imageHeaderMap = {
    ImageHeader1,
    ImageHeader2,
    ImageHeader3,
    ImageHeader4,
    ImageHeader5,
    ImageHeader6,
    ImageHeader7,
    ImageHeader8,
    ImageHeader9,
    ImageHeader10,
    ImageHeader11,
    ImageHeader12,
    ImageHeader13,
    ImageHeader14,
    ImageHeader15,
    ImageHeader16,
  };
  const imageHeaderName = 'ImageHeader' + headerImageRandNum;
  const DynamicComponent = imageHeaderMap[imageHeaderName];
  return (
    <View style={styles.imageHeaderContainer}>
      <View style={{marginTop: 0}}>
        <View style={{alignSelf: 'center'}}>
          <DynamicComponent height={200} width={400} />
        </View>
      </View>
    </View>
  );
};

const CurvedSegment = ({
  showSettings,
  setShowSettings,
  setShowDownloadableFiles,
  setShowExistingFiles,
}) => {
  const toggleSettings = () => {
    setShowSettings(!showSettings);
    setShowDownloadableFiles(false);
    setShowExistingFiles(false);
  };
  return (
    <View style={{backgroundColor: '#ADD8E6'}}>
      <View style={styles.curvedSegment}>
        <TouchableOpacity
          style={styles.settingsToggle}
          onPress={toggleSettings}>
          {showSettings ? (
            <IconGoBack height={25} width={25} style={styles.addIcon} />
          ) : (
            <IconGear height={25} width={25} style={styles.addIcon} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const MaterialsFolderList = ({materialsFolder, setCurrentFolder, history}) => {
  const openFolder = item => {
    setCurrentFolder(item);
    history.push('/Materials');
  };
  return (
    <>
      {materialsFolder.map((item, index) => {
        return (
          <View key={index}>
            <TouchableOpacity
              style={styles.item}
              onPress={() => openFolder(item)}>
              <Text>{item.name}</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </>
  );
};

const SettingsContainer = ({
  showDownloadableFiles,
  setShowDownloadableFiles,
  showExistingFiles,
  setShowExistingFiles,
  downloadableMaterials,
  downloadFiles,
  filesToDownload,
}) => {
  return (
    <>
      {!showDownloadableFiles && !showExistingFiles ? (
        <View>
          <TouchableOpacity
            style={styles.item}
            onPress={() => setShowDownloadableFiles(!showDownloadableFiles)}>
            <Text style={{marginHorizontal: 10}}>Download Materials</Text>
            <IconDownload height={30} width={30} color={'#000000'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() => setShowExistingFiles(!showExistingFiles)}>
            <Text style={{marginHorizontal: 10}}>Delete Materials</Text>
            <IconDelete height={30} width={30} color={'#000000'} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {showDownloadableFiles ? (
            filesToDownload.length > 0 ? (
              <>
                <Text style={styles.span}>
                  Please don't close the app. {filesToDownload.length} materials
                  left to download
                </Text>
              </>
            ) : (
              <ScrollView>
                <Text style={styles.span}>Click any materials to download</Text>
                {downloadableMaterials.map((item, index) => {
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
                        downloadFiles(item.year, item.subjects);
                      }}>
                      <Text>{item.year}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )
          ) : (
            <ScrollView>
              <Text>delete files</Text>
            </ScrollView>
          )}
        </>
      )}
    </>
  );
};

/***STYLES***/
const styles = StyleSheet.create({
  imageHeaderContainer: {
    backgroundColor: '#ADD8E6',
    fontFamily: 'Lato-Regular',
    padding: 15,
  },
  curvedSegment: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  settingsToggle: {
    margin: 5,
    padding: 10,
  },
  item: {
    height: 60,
    marginHorizontal: 10,
    marginBottom: 5,
    borderRadius: 10,
    backgroundColor: '#ADD8E6',
    fontFamily: 'Lato-Regular',
    flexDirection: 'row',
    alignItems: 'center', //vertical align text center
    justifyContent: 'center',
  },
  span: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  addIcon: {
    color: '#ADD8E6',
    borderRadius: 50,
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
