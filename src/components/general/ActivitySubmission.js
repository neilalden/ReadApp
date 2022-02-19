import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  BackHandler,
  Platform,
  PermissionsAndroid,
  Keyboard,
  ToastAndroid,
} from 'react-native';

import {ClassContext, fetchSubmision} from '../../context/ClassContext';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useHistory} from 'react-router';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import DocumentPicker from 'react-native-document-picker';
import FileViewer from 'react-native-file-viewer';
import IconUpload from '../../../assets/uploadFile.svg';
import IconRemove from '../../../assets/x-circle.svg';

const ActivitySubmission = ({userInfo, student, setStudent, setRefresh}) => {
  const [files, setFiles] = useState([]);
  const [text, onChangeText] = useState('');
  const [reload, setReload] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [studentInfo, setStudentInfo] = useState({});
  const [submission, setSubmission] = useState({});
  const [score, setScore] = useState('');
  const [isClosed, setIsClosed] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [height, setHeight] = useState(0);

  const {
    classNumber,
    classworkNumber,
    submissionListNumber,
    classList,
    setClassList,
  } = useContext(ClassContext);
  const history = useHistory();

  const classId = classList[classNumber].classId;
  const classwork = classList[classNumber].classworkList[classworkNumber];

  useEffect(() => {
    NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    if (!userInfo.isStudent) {
      setStudentInfo(student);
      setSubmission(
        classList[classNumber].classworkList[classworkNumber].submissionList[
          submissionListNumber
        ],
      );
    } else {
      setStudentInfo(userInfo);
      if (
        !classList[classNumber].classworkList[classworkNumber].submission ||
        reload
      ) {
        fetchSubmision(
          classNumber,
          classworkNumber,
          classList,
          setClassList,
          userInfo,
        );
        setReload(false);
      } else {
        setSubmission(
          classList[classNumber].classworkList[classworkNumber].submission,
        );
      }
    }

    if (
      new Date() >
        new Date(
          classwork.deadline.toDate
            ? classwork.deadline.toDate()
            : classwork.deadline.seconds * 1000,
        ) &&
      classwork.closeOnDeadline
    ) {
      setIsClosed(true);
    }

    // TO STOP THE BACK BUTTON FROM CLOSING THE APP
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (!userInfo.isStudent) {
        setStudent({});
      } else {
        history.push('/Classroom');
      }
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [reload, classList]);

  const filePath = `${classId}/classworks/${classwork.id}/`;
  return (
    <View>
      {!studentInfo.isStudent ? (
        <View style={styles.headerContainer}>
          <Text
            style={[
              styles.header,
              {
                color: '#ededed',
                textAlign: 'center',
                padding: 15,
              },
            ]}>
            {studentInfo.name}
          </Text>
        </View>
      ) : (
        <></>
      )}
      <View style={styles.questionContainer}>
        <Text style={styles.header}>Instruction</Text>
        <Text style={styles.item}>{classwork.instruction}</Text>
        <Text style={styles.header}>Score</Text>
        {!userInfo.isStudent ? (
          submission && submission.score && isEdit ? (
            <TextInput
              keyboardType="numeric"
              value={score}
              onChangeText={val => setScore(val)}
              style={[styles.item, {height: Math.max(35, height)}]}
              onContentSizeChange={e => {
                setHeight(e.nativeEvent.contentSize.height);
              }}
            />
          ) : submission && submission.score && !isEdit ? (
            <Text
              style={
                styles.item
              }>{`${submission.score}/${classwork.points}`}</Text>
          ) : (submission.work && submission.work !== '') ||
            (submission.files && submission.files.length !== 0) ? (
            <TextInput
              placeholder="no grades yet"
              keyboardType="numeric"
              value={score}
              style={[styles.item, {height: Math.max(35, height)}]}
              onContentSizeChange={e => {
                setHeight(e.nativeEvent.contentSize.height);
              }}
              onChangeText={val => setScore(val)}
            />
          ) : (
            <Text style={styles.item}>{`${
              submission.score ? submission.score : 0
            }/${classwork.points}`}</Text>
          )
        ) : (
          <Text style={styles.item}>{`${
            submission.score ? submission.score : 0
          }/${classwork.points}`}</Text>
        )}

        {classwork.files && <Text style={styles.header}>Activity files</Text>}
        <View style={styles.filesCardContainer}>
          {classwork.files &&
            classwork.files.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.fileItem}
                  onPress={() => {
                    const className = `${classList[classNumber].subject} ${classList[classNumber].section}`;
                    viewFile(item, classId, classwork, true, className);
                  }}>
                  <Text>{item.replace(`${classId}/classworks/`, '')}</Text>
                </TouchableOpacity>
              );
            })}
        </View>
      </View>
      {submission.work !== '' &&
        submission.files &&
        submission.files.length !== 0 &&
        submission.submittedAt &&
        classwork &&
        new Date(
          submission.submittedAt.toDate
            ? submission.submittedAt.toDate()
            : submission.submittedAt.seconds * 1000,
        ) >
          new Date(
            classwork.deadline.toDate
              ? classwork.deadline.toDate()
              : classwork.deadline.seconds * 1000,
          ) && (
          <Text style={[styles.subtitle, {color: 'red'}]}>Late submission</Text>
        )}

      {/* Student activity screen has three (3) states */}
      {/* > Student has not complied yet (allows user to send their submissions) */}
      {/* > Student has complied but work is not yet graded (allows users to edit and view their submission) */}
      {/* > Student has complied and their work is graded (only allows the user to view their score and submission) */}

      {(() => {
        if (
          (!submission.work || submission.work === '') &&
          (!submission.files || submission.files.length === 0) &&
          isClosed &&
          studentInfo.isStudent
        ) {
          return (
            <View style={styles.questionContainer}>
              <Text style={styles.subtitle}>Activity is close</Text>
            </View>
          );
        } else if (!userInfo.isStudent) {
          return (
            <View>
              {submission.work && submission.work != '' ? (
                <View style={styles.questionContainer}>
                  <Text style={styles.header}>Answer</Text>
                  <Text style={styles.item}>{submission.work}</Text>
                </View>
              ) : (
                <></>
              )}
              {submission.files && submission.files.length !== 0 ? (
                <View style={{marginHorizontal: 10}}>
                  <Text style={styles.header}>File submission(s)</Text>
                  <View style={styles.filesCardContainer}>
                    {submission.files.map((item, index) => {
                      return (
                        <TouchableOpacity
                          style={styles.fileItem}
                          key={index}
                          onPress={() => {
                            const className = `${classList[classNumber].subject} ${classList[classNumber].section}`;
                            viewFile(
                              item,
                              classId,
                              classwork,
                              false,
                              className,
                            );
                          }}>
                          <Text>{item.replace(filePath, '')}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : !submission.work || submission.work === '' ? (
                <Text style={styles.subtitle}>No submission</Text>
              ) : (
                <></>
              )}
              {(submission.work && submission.work != '') ||
              (submission.files && submission.files.length != 0) ? (
                submission.score ? (
                  isEdit ? (
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={() => {
                        let parsedScore = parseInt(score);
                        if (score == '' || Number.isNaN(parsedScore)) {
                          alert('Please write the appropriate score');
                          return;
                        }
                        const path = `classes/${filePath}submissions`;
                        handleSaveScore(
                          parsedScore,
                          path,
                          student,
                          submission,
                          setSubmission,
                          setRefresh,
                        );
                        setIsEdit(false);
                      }}>
                      <Text>Save</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        setScore(submission.score.toString());
                        setIsEdit(true);
                      }}>
                      <Text>Edit score</Text>
                    </TouchableOpacity>
                  )
                ) : (
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={() => {
                      let parsedScore = parseInt(score);
                      if (score == '' || Number.isNaN(parsedScore)) {
                        alert('Please write the appropriate score');
                        return;
                      }
                      const path = `classes/${filePath}submissions`;
                      handleSaveScore(
                        parsedScore,
                        path,
                        student,
                        submission,
                        setSubmission,
                        setRefresh,
                      );
                    }}>
                    <Text>Score student</Text>
                  </TouchableOpacity>
                )
              ) : (
                <></>
              )}
            </View>
          );
        } else if (
          submission &&
          (!submission.work || submission.work === '') &&
          (!submission.files || submission.files.length === 0)
        ) {
          // student is yet to comply
          return (
            <>
              <View style={styles.questionContainer}>
                <Text style={styles.header}>Answer</Text>

                <TextInput
                  style={[styles.item, {height: Math.max(35, height)}]}
                  onContentSizeChange={e => {
                    setHeight(e.nativeEvent.contentSize.height);
                  }}
                  placeholder="type your answer or comment here.."
                  multiline={true}
                  value={text}
                  onEndEditing={() => Keyboard.dismiss()}
                  onChangeText={val => onChangeText(val)}
                />
              </View>

              <View style={styles.filesCardContainer}>
                {files.map((item, index) => {
                  return (
                    <TouchableOpacity
                      style={[
                        styles.fileItem,
                        {
                          flexDirection: 'row',
                        },
                      ]}
                      key={index}
                      onPress={() => {
                        let filesCopy = [...files];
                        filesCopy.splice(index, 1);
                        setFiles(filesCopy);
                      }}>
                      <Text style={{maxWidth: '90%'}}>{item.fileName}</Text>
                      <IconRemove
                        height={20}
                        width={20}
                        style={styles.removeIcon}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => openFile(setFiles)}>
                  <View style={styles.uploadView}>
                    <Text style={styles.uploadText}>Upload file </Text>
                    <IconUpload style={styles.uploadIcon} />
                  </View>
                </TouchableOpacity>
                {isConnected && (
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={() =>
                      submit(
                        isClosed,
                        classId,
                        classwork,
                        files,
                        studentInfo,
                        text,
                        submission,
                        setFiles,
                        setIsEdit,
                        setReload,
                        isConnected,
                        onChangeText,
                      )
                    }>
                    <Text>Submit</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => {
                    saveToDrafts(
                      classId,
                      classwork,
                      files,
                      studentInfo,
                      text,
                      setFiles,
                      setIsEdit,
                      setReload,
                      onChangeText,
                    );
                  }}>
                  <Text>Save to drafts</Text>
                </TouchableOpacity>
              </View>
            </>
          );
        } else if (
          submission &&
          ((submission.work && submission.work != '') ||
            (submission.files && submission.files.length != 0)) &&
          !submission.score
        ) {
          // student has complied but not yet graded
          return (
            <View>
              {!isEdit ? (
                // student is viewing their ungraded submission
                <>
                  {submission.work && submission.work != '' ? (
                    <>
                      <View style={styles.questionContainer}>
                        <Text style={styles.header}>Answer</Text>
                        <Text style={styles.item}>{submission.work}</Text>
                      </View>
                    </>
                  ) : (
                    <></>
                  )}
                  {submission.files && submission.files.length !== 0 ? (
                    <View style={{marginHorizontal: 10}}>
                      <Text style={styles.header}>File submission(s)</Text>
                      <View style={styles.filesCardContainer}>
                        {submission.files.map((item, index) => {
                          return (
                            <TouchableOpacity
                              key={index}
                              style={styles.fileItem}
                              onPress={() => {
                                const className = `${classList[classNumber].subject} ${classList[classNumber].section}`;
                                viewFile(
                                  item,
                                  classId,
                                  classwork,
                                  false,
                                  className,
                                );
                              }}>
                              <Text>{item.replace(filePath, '')}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ) : (
                    <></>
                  )}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      onChangeText(submission.work);
                      setIsEdit(true);
                    }}>
                    <Text>Edit</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // student is editting their submission
                <>
                  <View style={styles.questionContainer}>
                    <Text style={styles.header}>Answer</Text>
                    <TextInput
                      style={[styles.item, {height: Math.max(35, height)}]}
                      onContentSizeChange={e => {
                        setHeight(e.nativeEvent.contentSize.height);
                      }}
                      defaultValue={submission.work}
                      value={text}
                      onChangeText={onChangeText}
                      placeholder="type your answer or comment here.."
                    />
                  </View>

                  {submission.files && submission.files.length !== 0 && (
                    <View style={{marginHorizontal: 10}}>
                      <Text style={styles.header}>File submission(s)</Text>
                      <View style={styles.filesCardContainer}>
                        {submission.files.map((item, index) => {
                          return (
                            <TouchableOpacity
                              style={[styles.fileItem, {flexDirection: 'row'}]}
                              key={index}
                              onPress={() =>
                                handleDeleteFile(
                                  submission.files[index],
                                  submission.files,
                                  text,
                                  classId,
                                  classwork,
                                  studentInfo,
                                  setReload,
                                )
                              }>
                              <Text style={{maxWidth: '90%'}}>
                                {item.replace(filePath, '')}
                              </Text>
                              <IconRemove
                                height={20}
                                width={20}
                                style={styles.removeIcon}
                              />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
                  {files && files.length !== 0 && (
                    <Text style={styles.header}>Added files</Text>
                  )}
                  <View style={styles.filesCardContainer}>
                    {files &&
                      files.map((item, index) => {
                        return (
                          <TouchableOpacity
                            style={[styles.fileItem, {flexDirection: 'row'}]}
                            key={index}
                            onPress={() => {
                              let filesCopy = [...files];
                              filesCopy.splice(index, 1);
                              setFiles(filesCopy);
                            }}>
                            <Text style={{maxWidth: '90%'}}>
                              {item.fileName}
                            </Text>
                            <IconRemove
                              height={20}
                              width={20}
                              style={styles.removeIcon}
                            />
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                  <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => openFile(setFiles)}>
                      <View style={styles.uploadView}>
                        <Text style={styles.uploadText}>Upload file </Text>
                        <IconUpload style={styles.uploadIcon} />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={() =>
                        submit(
                          isClosed,
                          classId,
                          classwork,
                          files,
                          studentInfo,
                          text,
                          submission,
                          setFiles,
                          setIsEdit,
                          setReload,
                          isConnected,
                          onChangeText,
                        )
                      }>
                      <Text>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.submitButton, {backgroundColor: 'gold'}]}
                      onPress={() => {
                        setReload(true);
                        setIsEdit(false);
                      }}>
                      <Text>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          );
        } else if (submission && submission.score) {
          // student has complied and graded
          return (
            <>
              <View style={styles.questionContainer}>
                <Text style={styles.header}>Answer</Text>
                <Text style={styles.item}>{submission.work}</Text>
              </View>

              {/* this is repeating code, honestly i should make it a component */}
              {submission.files ? (
                <View style={{marginHorizontal: 10}}>
                  <Text style={styles.header}>File submission(s)</Text>
                  <View style={styles.filesCardContainer}>
                    {submission.files.map((item, index) => {
                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.fileItem}
                          onPress={() => {
                            const className = `${classList[classNumber].subject} ${classList[classNumber].section}`;
                            viewFile(
                              item,
                              classId,
                              classwork,
                              false,
                              className,
                            );
                          }}>
                          <Text>{item.replace(filePath, '')}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <></>
              )}
            </>
          );
        }
      })()}
    </View>
  );
};

// FUNCTIONS

const requestStoragePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'ReadApp Storage Permission',
        message:
          'ReadApp needs access to your storage ' +
          'so you can upload files from your storage',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    alert('Error', `${err}`);
  }
};

const openFile = async setFiles => {
  try {
    const permission = await requestStoragePermission();
    if (permission) {
      DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.allFiles],
        mode: 'open',
        copyTo: 'cachesDirectory',
      })
        .then(res => {
          setFiles(prev => [
            ...prev,
            {fileName: res[0].name, uri: res[0].fileCopyUri},
          ]);
        })
        .catch(e => alert(`${e}`));
    } else {
      alert('Alert', 'Unable to upload file');
    }
  } catch (e) {
    alert(e);
  }
};

const saveToDrafts = (
  classId,
  classwork,
  files,
  studentInfo,
  text,
  setFiles,
  setIsEdit,
  setReload,
  onChangeText,
) => {
  if (files.length === 0 && text === '') {
    ToastAndroid.showWithGravity(
      'Please answer the activity or add a file',
      ToastAndroid.LONG,
      ToastAndroid.CENTER,
    );
    return;
  }
  AsyncStorage.getItem(`drafts-${classId}`)
    .then(jsonValue => {
      let draftsArr = JSON.parse(jsonValue) ? JSON.parse(jsonValue).drafts : [];
      for (let i in draftsArr) {
        if (draftsArr[i].title == classwork.title) {
          draftsArr.splice(i, 1);
        }
      }
      draftsArr.push({
        files: files,
        work: text,
        path: `classes/${classId}/classworks/${classwork.id}/submissions`,
        title: classwork.title,
        isActivity: true,
        id: studentInfo.id,
      });
      AsyncStorage.setItem(
        `drafts-${classId}`,
        JSON.stringify({drafts: draftsArr}),
      )
        .then(() => {
          ToastAndroid.showWithGravity(
            'Classwork saved!',
            ToastAndroid.LONG,
            ToastAndroid.CENTER,
          );

          setFiles([]);
          onChangeText('');
          setIsEdit(false);
          setReload(true);
        })
        .catch(e => alert(e.message));
    })
    .catch(e => alert(e.message));
};

const submit = async (
  isClosed,
  classId,
  classwork,
  files,
  studentInfo,
  text,
  submission,
  setFiles,
  setIsEdit,
  setReload,
  isConnected,
  onChangeText,
) => {
  if (isClosed) {
    alert('This activity is close');
    return;
  }
  const filePath = `${classId}/classworks/${classwork.id}/`;
  let urls = [];

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
  if (!isConnected) {
    saveToDrafts(
      classId,
      classwork,
      files,
      studentInfo,
      text,
      setFiles,
      setIsEdit,
      setReload,
      onChangeText,
    );
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

    if (files.length > 0) {
      for (let i in files) {
        const documentUri = await getPathForFirebaseStorage(files[i].uri);
        const reference = storage().ref(filePath + files[i].fileName);
        reference
          .putFile(documentUri)
          .then(() => {
            urls.push(filePath + files[i].fileName);
            if (urls.length === files.length) {
              const filePath = `${classId}/classworks/${classwork.id}/`;
              urls = urls.concat(submission.files ? submission.files : []);

              firestore()
                .collection(
                  `classes/${classId}/classworks/${classwork.id}/submissions`,
                )
                .doc(studentInfo.id)
                .set({
                  submittedAt: firestore.FieldValue.serverTimestamp(),
                  files: urls,
                  work: text,
                })
                .then(res => {
                  alert(`Success`);
                  setFiles([]);
                  setIsEdit(false);
                  setReload(true);
                })
                .catch(e => alert(e));
            }
          })
          .catch(e => {
            alert(e);
          });
      }
    } else {
      firestore()
        .collection(`classes/${classId}/classworks/${classwork.id}/submissions`)
        .doc(studentInfo.id)
        .set({
          submittedAt: firestore.FieldValue.serverTimestamp(),
          files: [],
          work: text,
        })
        .then(res => {
          alert(`Success`);
          setFiles([]);
          setIsEdit(false);
          setReload(true);
        })
        .catch(e => alert(e));
    }
  }
};

const viewFile = async (
  file,
  classId,
  classwork,
  fromInstructions,
  className,
) => {
  const permission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    {
      title: 'ReadApp Storage Permission',
      message: 'ReadApp needs access to your storage to save files',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    },
  );
  if (permission) {
    ToastAndroid.showWithGravity(
      'Loading...',
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
    const filePath = fromInstructions
      ? `${classId}/classworks/`
      : `${classId}/classworks/${classwork.id}/`;
    const localFile = `${
      RNFS.DownloadDirectoryPath
    }/${className}/${file.replace(filePath, '')}`;

    RNFS.exists(localFile).then(exists => {
      if (exists) {
        FileViewer.open(localFile);
      } else {
        storage()
          .ref(file)
          .getDownloadURL()
          .then(url => {
            const options = {
              fromUrl: url,
              toFile: localFile,
            };
            RNFS.exists(`${RNFS.DownloadDirectoryPath}/${className}`).then(
              x => {
                if (!x) {
                  RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/${className}`);
                }
                RNFS.downloadFile(options)
                  .promise.then(() => FileViewer.open(localFile))
                  .then(() => {})
                  .catch(error => {
                    alert(error);
                  });
              },
            );
          })
          .catch(e => alert(e));
      }
    });
  }
};

const handleDeleteFile = (
  itemFilePath,
  submissionFiles,
  text,
  classId,
  classwork,
  studentInfo,
  setReload,
) => {
  let filesCopy = [...submissionFiles];
  for (let i in filesCopy) {
    if (itemFilePath == filesCopy[i]) filesCopy.splice(i, 1);
  }
  const desertRef = storage().ref(itemFilePath);
  desertRef
    .delete()
    .then(function () {
      firestore()
        .collection(`classes/${classId}/classworks/${classwork.id}/submissions`)
        .doc(studentInfo.id)
        .set({
          files: filesCopy,
          work: text ? text : '',
          submittedAt: firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          setReload(true);
        })
        .catch(e => alert(e));
    })
    .catch(function (error) {
      alert(error);
    });
};
const handleSaveScore = (
  score,
  path,
  student,
  submission,
  setSubmission,
  setRefresh,
) => {
  firestore()
    .collection(path)
    .doc(student.id)
    .update({score: parseInt(score)})
    .then(() => {
      let copySubmission = {...submission};
      copySubmission.score = score;
      setSubmission(copySubmission);
      setRefresh(true);
    })
    .catch(e => alert(e));
};
const alert = (e, title = 'Alert') =>
  Alert.alert(title, `${e ? e : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => true},
  ]);
const styles = StyleSheet.create({
  item: {
    justifyContent: 'space-between',
    backgroundColor: '#E8EAED',
    fontFamily: 'Lato-Regular',
    marginHorizontal: 15,
    marginVertical: 3,
    borderRadius: 10,
    padding: 15,
  },
  itemSubtitle: {
    fontFamily: 'Lato-Regular',
    marginRight: 5,
    color: '#000',
  },

  header: {
    fontSize: 18,
    fontFamily: 'Lato-Regular',
    marginHorizontal: 15,
  },
  headerContainer: {
    backgroundColor: '#3d3d3d',
    justifyContent: 'center',
    width: 'auto',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  buttonsContainer: {
    justifyContent: 'center',
    marginVertical: 15,
  },
  uploadButton: {
    borderColor: '#ADD8E6',
    borderWidth: 5,
    marginVertical: 5,
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 10,
  },
  uploadView: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginHorizontal: 85,
  },
  submitButton: {
    marginVertical: 5,
    backgroundColor: '#ADD8E6',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButton: {
    marginVertical: 5,
    backgroundColor: 'gold',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  filesCardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  fileItem: {
    backgroundColor: '#E8EAED',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 2,
    marginVertical: 5,
  },
  questionContainer: {
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    marginHorizontal: 15,
    marginVertical: 5,
    paddingVertical: 10,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
    color: '#000',
  },
  toDeleteFile: {
    flexDirection: 'row',
  },

  fileCard: {
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 2,
    marginVertical: 5,
  },
  removeIcon: {color: 'red', marginLeft: 2},

  uploadIcon: {
    color: '#000',
    height: 20,
    width: 20,
    marginLeft: 5,
  },
});
export default ActivitySubmission;
