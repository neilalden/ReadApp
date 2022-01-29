import React, {useCallback, useContext, useEffect, useState} from 'react';

import NetInfo from '@react-native-community/netinfo';
import {
  View,
  Text,
  Alert,
  BackHandler,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import {Link, useHistory} from 'react-router-native';
import IconGoBack from '../../../assets/goback.svg';
import IconAddClass from '../../../assets/addClass.svg';
import IconDrafts from '../../../assets/archive.svg';
import IconDelete from '../../../assets/trash.svg';

import {
  ClassContext,
  fetchClassworkList,
  fetchLectures,
} from '../../context/ClassContext';
import ClassroomHeader from './ClassroomHeader';
import ClassroomNav from './ClassroomNav';

const ClassroomPage = ({userInfo}) => {
  /***STATES***/
  const history = useHistory();
  const {classNumber, classList, setClassList, setClassworkNumber} =
    useContext(ClassContext);
  const [isConnected, setIsConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  /***HOOKS***/
  useEffect(() => {
    NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    // FETCH CLASSWORKLIST OF THE OPENNED CLASS IF IT DOES NOT EXIST YET
    // fetchClassworkList(classNumber, classList, setClassList);
    // fetchLectures(classNumber, classList, setClassList);

    // TO STOP THE BACK BUTTON FROM CLOSING THE APP
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/ClassList');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);
  useEffect(() => {
    const classId = classList[classNumber].classId;
    let classListCopy = [...classList];
    let classworkList = [];
    const subscriber = firestore()
      .collection(`classes/${classId}/classworks`)
      .orderBy('createdAt', 'desc')
      .onSnapshot(documentSnapshot => {
        // FETCH CLASSWORKLIST OF THE OPENNED CLASS IF IT DOES NOT EXIST YET
        fetchClassworkList(classNumber, classList, setClassList);
        fetchLectures(classNumber, classList, setClassList);
        // documentSnapshot.forEach(res => {
        //   let questions = undefined;
        //   if (res.data().questions) {
        //     questions = shuffle(res.data().questions);
        //   }
        //   classworkList.push({
        //     id: res.id,
        //     title: res.data().title,
        //     deadline: res.data().deadline,
        //     closeOnDeadline: res.data().closeOnDeadline,
        //     instruction: res.data().instruction,
        //     points: res.data().points,
        //     isActivity: res.data().isActivity,
        //     files: res.data().files,
        //     questions: questions,
        //     pointsPerRight: res.data().pointsPerRight,
        //     pointsPerWrong: res.data().pointsPerWrong,
        //   });
        // });

        // classListCopy[classNumber].classworkList = classworkList;
        // setClassList(classworkList);
      });

    function shuffle(array) {
      var currentIndex = array.length,
        randomIndex;

      // While there remain elements to shuffle...
      while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex],
        ];
      }

      return array;
    }
    // Stop listening for updates when no longer required
    return () => subscriber();
  }, []);

  /***FUNCTIONS***/
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClassworkList(classNumber, classList, setClassList);
    fetchLectures(classNumber, classList, setClassList);
    wait(1000).then(() => setRefreshing(false));
  }, []);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  return (
    <>
      <ScrollView
        style={{backgroundColor: '#fff'}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <ClassroomHeader classroom={classList[classNumber]} />
        <Segment
          userInfo={userInfo}
          setShowDrafts={setShowDrafts}
          showDrafts={showDrafts}
          setDrafts={setDrafts}
          drafts={drafts}
          classList={classList}
          classNumber={classNumber}
          history={history}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        {showDrafts ? (
          <DraftsList
            drafts={drafts}
            setDrafts={setDrafts}
            classList={classList}
            classNumber={classNumber}
            isConnected={isConnected}
            onRefresh={onRefresh}
            setShowDrafts={setShowDrafts}
          />
        ) : (
          <ClassworkList
            classList={classList}
            classNumber={classNumber}
            setClassworkNumber={setClassworkNumber}
            activeTab={activeTab}
          />
        )}
      </ScrollView>
      <ClassroomNav isStudent={userInfo.isStudent} />
    </>
  );
};

const ClassworkList = ({
  classList,
  classNumber,
  setClassworkNumber,
  activeTab,
}) => {
  return (
    <ScrollView>
      {(activeTab === 0 || activeTab === 1) &&
      classList[classNumber].classworkList &&
      classList[classNumber].classworkList.length !== 0 ? (
        <ScrollView>
          {classList[classNumber].classworkList.map((item, index) => {
            if (item.isActivity && activeTab === 0) {
              return;
            } else if (!item.isActivity && activeTab === 1) {
              return;
            }
            let dt = new Date(
              item.deadline.toDate
                ? item.deadline.toDate()
                : item.deadline.seconds * 1000,
            );
            const day = dt.getDate();
            const month = dt.getMonth();
            const year = dt.getFullYear();
            const hour = dt.getHours();
            const minute = dt.getMinutes();
            const ampm = hour > 12 ? 'pm' : 'am';
            return (
              <Link
                to="/Classwork"
                underlayColor="#C1E1EC"
                key={index}
                style={styles.item}
                onPress={() => {
                  setClassworkNumber(index);
                }}>
                <View style={styles.itemContainer}>
                  <View>
                    <Text style={styles.itemText}>{item.title}</Text>
                    <Text style={styles.itemTextSubs}>
                      Deadline: {MONTHS[month]}/{day}/{year}{' '}
                      {hour > 12 ? hour - 12 : hour}:{minute} {ampm}
                    </Text>
                  </View>
                  {item.closeOnDeadline && (
                    <Text style={styles.itemTextSubs}>
                      will close{'\n'}on deadline
                    </Text>
                  )}
                </View>
              </Link>
            );
          })}
        </ScrollView>
      ) : activeTab == 2 &&
        classList[classNumber].lectures &&
        classList[classNumber].lectures.length !== 0 ? (
        <ScrollView>
          {classList[classNumber].lectures.map((item, index) => {
            return (
              <View key={index} style={styles.card}>
                <View style={styles.cardBodyContainer}>
                  <Text style={styles.cardTitleText}>{item.title}</Text>
                  {item.instruction !== '' && (
                    <Text style={styles.cardBodyText}>{item.instruction}</Text>
                  )}
                </View>
                <View style={styles.filesCardContainer}>
                  {item.files &&
                    item.files.map((file, index) => {
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() =>
                            viewFile(file, classList[classNumber].classId)
                          }
                          style={[
                            styles.card,
                            {marginHorizontal: 2, backgroundColor: '#E8EAED'},
                          ]}>
                          <Text>
                            {file.replace(
                              `${classList[classNumber].classId}/lectures/`,
                              '',
                            )}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={styles.itemTextSubs}>No classworks yet</Text>
      )}
    </ScrollView>
  );
};

const Segment = ({
  userInfo,
  setShowDrafts,
  showDrafts,
  setDrafts,
  drafts,
  classList,
  classNumber,
  history,
  activeTab,
  setActiveTab,
}) => {
  const classId = classList[classNumber].classId;
  return (
    <View style={styles.segmentContainer}>
      {!showDrafts ? (
        <View style={styles.tabButtonContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab(0)}
            style={[
              styles.tabButton,
              styles.tabButtonLeft,
              activeTab === 0 && styles.activeTab,
            ]}>
            <Text style={styles.tabButtonText}>Quizes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab(1)}
            style={[styles.tabButton, activeTab === 1 && styles.activeTab]}>
            <Text style={styles.tabButtonText}>Activities</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab(2)}
            style={[
              styles.tabButton,
              styles.tabButtonRight,
              activeTab === 2 && styles.activeTab,
            ]}>
            <Text style={styles.tabButtonText}>Lectures</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View></View>
      )}
      {!userInfo.isStudent ? (
        <CreateClassworkButton history={history} />
      ) : (
        <ShowDraftsButton
          showDrafts={showDrafts}
          setShowDrafts={setShowDrafts}
          drafts={drafts}
          setDrafts={setDrafts}
          classId={classId}
        />
      )}
    </View>
  );
};

const CreateClassworkButton = ({history}) => {
  return (
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => {
        history.push('/CreateClasswork');
      }}>
      <IconAddClass height={30} width={30} style={styles.addIcon} />
    </TouchableOpacity>
  );
};

const ShowDraftsButton = ({
  showDrafts,
  setShowDrafts,
  drafts,
  setDrafts,
  classId,
}) => {
  const handleShowDrafts = () => {
    setShowDrafts(!showDrafts);
    if (drafts.length === 0) {
      AsyncStorage.getItem(`drafts-${classId}`)
        .then(jsonValue => {
          if (jsonValue !== null) {
            setDrafts(JSON.parse(jsonValue).drafts);
          }
        })
        .catch(e => alert(e.message, e.code));
    }
  };
  return (
    <TouchableOpacity
      style={[
        showDrafts ? styles.addButton : styles.archiveButton,
        {flexDirection: 'row'},
      ]}
      onPress={handleShowDrafts}>
      {showDrafts ? (
        <IconGoBack height={30} width={30} style={styles.addIcon} />
      ) : (
        <IconDrafts
          height={20}
          width={20}
          style={{
            color: '#fff',
            alignSelf: 'center',
          }}
        />
      )}
    </TouchableOpacity>
  );
};

const DraftsList = ({
  drafts,
  setDrafts,
  classList,
  classNumber,
  isConnected,
  onRefresh,
  setShowDrafts,
}) => {
  return (
    <ScrollView>
      {drafts.length > 0 ? (
        drafts.map((item, index) => {
          return (
            <View key={index} style={styles.item}>
              <TouchableOpacity
                style={{padding: 15, width: '85%'}}
                onPress={() =>
                  submitDraft(
                    drafts,
                    setDrafts,
                    index,
                    classList[classNumber].classId,
                    isConnected,
                    onRefresh,
                    setShowDrafts,
                  )
                }>
                <Text>{item.title}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteIconContainer}
                onPress={() =>
                  removeDraft(
                    drafts,
                    setDrafts,
                    index,
                    classList[classNumber].classId,
                  )
                }>
                <IconDelete height={30} width={30} color={'red'} />
              </TouchableOpacity>
            </View>
          );
        })
      ) : (
        <Text style={styles.itemTextSubs}>No drafts</Text>
      )}
    </ScrollView>
  );
};

/***FUNCTIONS***/

const submitDraft = (
  drafts,
  setDrafts,
  index,
  classId,
  isConnected,
  onRefresh,
  setShowDrafts,
) => {
  // check for connection
  // check if graded, if graded remove draft
  // if there are files, get url
  if (!isConnected) {
    alert('You need internet connection to submit classworks');
  } else {
    NetInfo.addEventListener(state => {
      if (state.type == 'wifi') {
        if (state.details.strength < 5) {
          alert(
            'Failed to submit activity due to week internet connection.\n Try again later',
            'Unable to submit activity',
          );
          return;
        } else {
          firestore()
            .collection(`${drafts[index].path}`)
            .doc(drafts[index].id)
            .get()
            .then(async res => {
              if (res.data() && res.data().score) {
                let draftsArr = [...drafts];
                draftsArr.splice(index, 1);
                setDrafts(draftsArr);
                AsyncStorage.setItem(
                  `drafts-${classId}`,
                  JSON.stringify({drafts: draftsArr}),
                )
                  .then(() => {})
                  .catch(e => alert(e.message));
                alert(`You have already complied in this classwork`);
              } else {
                // check for files
                let files = drafts[index].files ? drafts[index].files : [];
                let work = drafts[index].work ? drafts[index].work : '';

                if (files.length > 0) {
                  for (let i in files) {
                    const pathArr = drafts[index].path.split('/');
                    const filePath = `${pathArr[1]}/${pathArr[2]}/${pathArr[3]}/`;
                    // const documentUri = await getPathForFirebaseStorage(files[i].uri);
                    const reference = storage().ref(
                      filePath + files[i].fileName,
                    );
                    let urls = [];
                    reference
                      .putFile(files[i].uri)
                      .then(() => {
                        urls.push(filePath + files[i].fileName);
                        if (urls.length === files.length) {
                          firestore()
                            .collection(drafts[index].path)
                            .doc(drafts[index].id)
                            .set({
                              submittedAt:
                                firestore.FieldValue.serverTimestamp(),
                              files: urls,
                              work: work,
                            })
                            .then(() => {
                              let copyDrafts = [...drafts];
                              copyDrafts.splice(index, 1);
                              AsyncStorage.setItem(
                                `drafts-${classId}`,
                                JSON.stringify({drafts: copyDrafts}),
                              )
                                .then(() => {
                                  setDrafts(copyDrafts);
                                  setShowDrafts(false);
                                  onRefresh();
                                  alert(`Success`);
                                })
                                .catch(e => alert(e.message));
                            })
                            .catch(e => alert(e));
                        }
                      })
                      .catch(e => {
                        alert(e);
                      });
                  }
                } else {
                  // quiz classwork has score attribute
                  let score = drafts[index].score;
                  firestore()
                    .collection(drafts[index].path)
                    .doc(drafts[index].id)
                    .set(
                      score
                        ? {
                            submittedAt: firestore.FieldValue.serverTimestamp(),
                            files: [],
                            work: work,
                            score: score,
                          }
                        : {
                            submittedAt: firestore.FieldValue.serverTimestamp(),
                            files: [],
                            work: work,
                          },
                    )
                    .then(() => {
                      let copyDrafts = [...drafts];
                      copyDrafts.splice(index, 1);
                      AsyncStorage.setItem(
                        `drafts-${classId}`,
                        JSON.stringify({drafts: copyDrafts}),
                      )
                        .then(() => {
                          setDrafts(copyDrafts);
                          setShowDrafts(false);
                          onRefresh();
                          alert(`Success`);
                        })
                        .catch(e => alert(e.message));
                    })
                    .catch(e => alert(e));
                }

                // save to firestore
              }
            })
            .catch(e => alert(e.message));
        }
      }
    });
  }
};
const removeDraft = (drafts, setDrafts, index, classId) => {
  let copyDrafts = [...drafts];
  copyDrafts.splice(index, 1);
  AsyncStorage.setItem(
    `drafts-${classId}`,
    JSON.stringify({drafts: copyDrafts}),
  )
    .then(() => {
      setDrafts(copyDrafts);
    })
    .catch(e => alert(e.message));
};
const viewFile = (file, classId) => {
  ToastAndroid.showWithGravity(
    'Loading...',
    ToastAndroid.SHORT,
    ToastAndroid.CENTER,
  );
  const filePath = `${classId}/lectures/`;
  storage()
    .ref(file)
    .getDownloadURL()
    .then(url => {
      const localFile = `${RNFS.DocumentDirectoryPath}/${file.replace(
        filePath,
        '',
      )}`;
      const options = {
        fromUrl: url,
        toFile: localFile,
      };
      RNFS.downloadFile(options)
        .promise.then(() => FileViewer.open(localFile))
        .then(() => {
          // success
        })
        .catch(error => {
          alert('ERROR', error);
        });
    })
    .catch(e => alert(e.code, e.message));
};

const styles = StyleSheet.create({
  addButton: {
    margin: 10,
    alignSelf: 'flex-end',
  },
  archiveButton: {
    margin: 10,
    alignSelf: 'flex-end',
    backgroundColor: '#ADD8E6',
    borderRadius: 50,
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  item: {
    height: 70,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: '#ADD8E6',
    fontFamily: 'Lato-Regular',
    flexDirection: 'row',
    alignItems: 'center', //vertical align text center
  },
  itemText: {
    fontFamily: 'Lato-Regular',
    fontSize: 20,
    paddingVertical: 5,
  },
  itemTextSubs: {
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
  },
  itemContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    alignItems: 'center', //vertical align text center
  },
  addIcon: {
    backgroundColor: '#ADD8E6',
    color: '#fff',
    borderRadius: 50,
  },
  deleteIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 50,
  },
  segmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tabButtonContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  tabButton: {
    justifyContent: 'center',
    backgroundColor: '#E8EAED',
    // paddingHorizontal: 10,
    width: 80,
    alignItems: 'center',
  },
  tabButtonLeft: {
    borderTopStartRadius: 10,
    borderBottomStartRadius: 10,
  },
  tabButtonRight: {
    borderTopEndRadius: 10,
    borderBottomEndRadius: 10,
  },
  tabButtonText: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
  },
  activeTab: {
    backgroundColor: '#63b4cf',
  },
  card: {
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
  },

  cardTitleText: {
    fontFamily: 'Lato-Regular',
    fontSize: 20,
  },

  cardBodyContainer: {
    backgroundColor: '#E8EAED',
    borderRadius: 10,
    margin: 2,
    padding: 10,
  },
  cardBodyText: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    marginTop: 10,
  },

  filesCardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
});

const alert = (message, title = 'Alert!') => {
  Alert.alert(title, message, [{text: 'OK', onPress: () => true}]);
};
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'June',
  'July',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

export default ClassroomPage;
