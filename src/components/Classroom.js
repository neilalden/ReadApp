import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  BackHandler,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import ClassroomHeader from './ClassroomHeader';
import {Link, useHistory} from 'react-router-native';
import {ClassContext, fetchClassworkList} from '../context/ClassContext';
import IconAddClass from '../../assets/addClass.svg';
import IconDrafts from '../../assets/sd-card.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import IconRemove from '../../assets/x-circle.svg';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'rn-fetch-blob';

import IconGoBack from '../../assets/goback.svg';

// CLASSROOM IS THE SAME FOR BOTH STUDENT AND TEACHER ACCOUNT TYPE

const Classroom = ({userInfo}) => {
  // CLASSNUMBER IS THE POSITION OF THE OPENNED CLASS IN THE CLASSLIST ARRAY
  const {classNumber, classList, setClassList, setClassworkNumber} =
    useContext(ClassContext);
  const history = useHistory();
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClassworkList(
      classNumber,
      classList,
      setClassList,
      setClassworkNumber,
    );
    wait(1000).then(() => setRefreshing(false));
  }, []);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };

  useEffect(() => {
    NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    // FETCH CLASSWORKLIST OF THE OPENNED CLASS IF IT DOES NOT EXIST YET
    !classList[classNumber].classworkList &&
      fetchClassworkList(
        classNumber,
        classList,
        setClassList,
        setClassworkNumber,
      );

    // TO STOP THE BACK BUTTON FROM CLOSING THE APP
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/ClassList');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);
  const handleDeleteTask = (index, title) => {
    if (userInfo.isStudent) {
      alert('Only teachers can remove classworks');
      return;
    }
    Alert.alert(`Remove ${title}?`, 'This can NOT be undone', [
      {
        text: 'YES',
        onPress: () => {
          firestore()
            .collection(`classes`)
            .doc(
              `${classList[classNumber].classId}/classworks/${classList[classNumber].classworkList[index].id}`,
            )
            .delete()
            .then(() => {
              onRefresh();
              alert(`Classwork removed!`);
            });
        },
      },
      {text: 'NO', onPress: () => true},
    ]);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <ClassroomHeader
        subject={classList[classNumber].subject}
        isStudent={userInfo.isStudent}
      />
      {!userInfo.isStudent ? (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            history.push('/CreateClasswork');
          }}>
          <IconAddClass height={30} width={30} color={Colors.black} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.addButton, {flexDirection: 'row'}]}
          onPress={() => {
            setShowDrafts(!showDrafts);
            if (drafts.length === 0) {
              AsyncStorage.getItem(`drafts-${classList[classNumber].classId}`)
                .then(jsonValue => {
                  if (jsonValue !== null) {
                    setDrafts(JSON.parse(jsonValue).drafts);
                  }
                })
                .catch(e => alert(e.message));
            }
          }}>
          {showDrafts ? (
            <>
              <Text style={styles.itemText}>Back</Text>
              <IconGoBack height={25} width={25} color={Colors.black} />
            </>
          ) : (
            <>
              <Text style={styles.itemText}>Drafts</Text>
              <IconDrafts height={25} width={25} color={Colors.black} />
            </>
          )}
        </TouchableOpacity>
      )}
      {showDrafts ? (
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
                    style={{
                      width: '15%',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() =>
                      removeDraft(
                        drafts,
                        setDrafts,
                        index,
                        classList[classNumber].classId,
                      )
                    }>
                    <IconRemove height={30} width={30} color={'red'} />
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <Text style={styles.subtitle}>No drafts</Text>
          )}
        </ScrollView>
      ) : (
        <ScrollView>
          {classList[classNumber].classworkList &&
          classList[classNumber].classworkList.length !== 0 ? (
            <ScrollView>
              {classList[classNumber].classworkList.map((item, index) => {
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
                const ampm = hour >= 12 ? 'pm' : 'am';
                return (
                  <View key={index} style={styles.item}>
                    <Link
                      to="/Classwork"
                      underlayColor="#C1E1EC"
                      onPress={() => {
                        setClassworkNumber(index);
                      }}
                      style={
                        userInfo.isStudent
                          ? {
                              width: '100%',
                              padding: 15,
                              borderRadius: 10,
                            }
                          : {
                              width: '80%',
                              padding: 15,
                              borderRadius: 10,
                            }
                      }>
                      <>
                        <Text style={styles.itemText}>{item.title}</Text>
                        <Text style={styles.itemTextSubs}>
                          Deadline: {MONTHS[month]}/{day}/{year}{' '}
                          {hour >= 12 ? hour - 12 : hour}:{minute} {ampm}
                        </Text>
                      </>
                    </Link>
                    {!userInfo.isStudent ? (
                      <TouchableOpacity
                        onPress={() => handleDeleteTask(index, item.title)}
                        style={{
                          width: '15%',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <IconRemove height={30} width={30} color={'red'} />
                      </TouchableOpacity>
                    ) : (
                      <></>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={styles.subtitle}>No classworks yet</Text>
          )}
        </ScrollView>
      )}
    </ScrollView>
  );
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
const alert = (message, title = 'Alert!') => {
  Alert.alert(title, message, [{text: 'OK', onPress: () => true}]);
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
        if (state.details.strength < 25) {
          alert(
            'Failed to submit activity due to week internet connection.\n Try again later',
            'Unable to submit activity',
          );
          return;
        }
      }
    });

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
              const reference = storage().ref(filePath + files[i].fileName);
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
                        submittedAt: firestore.FieldValue.serverTimestamp(),
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
};
const getPathForFirebaseStorage = async uri => {
  if (Platform.OS === 'ios') {
    return uri;
  }
  try {
    const stat = await RNFetchBlob.fs.stat(uri);
    return stat.path;
  } catch (e) {
    alert(`${e}`, 'Move file to internal storage');
  }
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    justifyContent: 'space-between',
    fontFamily: 'Lato-Regular',
    marginHorizontal: 15,
    marginVertical: 3,
    flexDirection: 'row',
  },
  itemText: {
    fontFamily: 'Lato-Regular',
    fontSize: 20,
    paddingBottom: 3,
  },
  itemTextSubs: {
    fontFamily: 'Lato-Regular',
    paddingTop: 3,
    paddingBottom: 3,
    textAlignVertical: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
    color: '#ccc',
  },
  addButton: {
    margin: 10,
    alignSelf: 'flex-end',
  },
});
export default Classroom;
