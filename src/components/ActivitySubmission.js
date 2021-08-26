import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  BackHandler,
} from 'react-native';
import {useHistory} from 'react-router';
import {ClassContext, fetchSubmision} from '../context/ClassContext';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import FileViewer from 'react-native-file-viewer';
import IconUpload from '../../assets/uploadFile.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import IconRemove from '../../assets/x-circle.svg';

const ActivitySubmission = ({userInfo}) => {
  const [files, setFiles] = useState([]);
  const [text, onChangeText] = useState('');
  const [reload, setReload] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const history = useHistory();
  const {classNumber, classworkNumber, classList, setClassList} =
    useContext(ClassContext);

  const classId = classList[classNumber].classId;
  const classwork = classList[classNumber].classworkList[classworkNumber];
  const submission =
    classList[classNumber].classworkList[classworkNumber].submission;
  useEffect(() => {
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
    }

    // TO STOP THE BACK BUTTON FROM CLOSING THE APP
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/Classroom');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [reload]);

  const filePath = `${classId}/classworks/${classwork.id}/`;
  return (
    <View>
      <View style={styles.questionContainer}>
        <Text style={styles.header}>Instruction</Text>
        <Text style={styles.item}>{classwork.instruction}</Text>
        <Text style={styles.header}>Score</Text>
        <Text style={styles.item}>
          {submission && submission.score ? submission.score : 'no grades yet'}
        </Text>
      </View>

      {/* Student activity screen has three (3) states */}
      {/* > Student has not complied yet (allows user to send their submissions) */}
      {/* > Student has complied but work is not yet graded (allows users to edit and view their submission) */}
      {/* > Student has complied and their work is graded (only allows the user to view their score and submission) */}

      {(() => {
        if (
          submission &&
          !submission.work &&
          (!submission.files || submission.files.length === 0)
        ) {
          // student is yet to comply
          return (
            <>
              <View style={styles.questionContainer}>
                <Text style={styles.header}>Answer/Comment</Text>
                <TextInput
                  style={styles.item}
                  placeholder="type your answer or comment here.."
                  onChangeText={val => onChangeText(val)}
                  value={text}
                />
              </View>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => openFile(setFiles)}>
                  <View style={styles.uploadView}>
                    <Text style={styles.uploadText}>Upload file </Text>
                    <IconUpload
                      style={styles.icon}
                      height={20}
                      width={20}
                      color={Colors.black}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() =>
                    submit(
                      classId,
                      classwork,
                      files,
                      userInfo,
                      text,
                      submission,
                      setFiles,
                      setIsEdit,
                      setReload,
                    )
                  }>
                  <Text>Submit</Text>
                </TouchableOpacity>
              </View>
              {files.map((item, index) => {
                return (
                  <TouchableOpacity
                    style={styles.fileItem}
                    key={index}
                    onPress={() => {
                      let filesCopy = [...files];
                      filesCopy.splice(index, 1);
                      setFiles(filesCopy);
                    }}>
                    <Text>{item.fileName}</Text>
                    <Text style={{marginRight: 5, color: 'red'}}>✖️</Text>
                  </TouchableOpacity>
                );
              })}
            </>
          );
        } else if (
          submission &&
          (submission.work || submission.files) &&
          !submission.score
        ) {
          // student has complied but not yet graded
          return (
            <View>
              {!isEdit ? (
                // student is viewing their ungraded submission
                <>
                  {submission.work ? (
                    <>
                      <View style={styles.questionContainer}>
                        <Text style={styles.header}>Answer/Comment</Text>
                        <Text style={styles.item}>{submission.work}</Text>
                      </View>
                    </>
                  ) : (
                    <></>
                  )}
                  {submission.files && submission.files.length !== 0 ? (
                    <View>
                      <Text style={styles.header}>File submission(s)</Text>
                      <View style={[styles.item, {backgroundColor: '#ADD8E6'}]}>
                        {submission.files.map((item, index) => {
                          return (
                            <TouchableOpacity
                              key={index}
                              style={styles.fileItem}
                              onPress={() =>
                                viewFile(item, classId, classwork)
                              }>
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
                    <Text style={styles.header}>Answer/Comment</Text>
                    <TextInput
                      style={styles.item}
                      value={text}
                      onChangeText={onChangeText}
                      placeholder="type your answer or comment here.."
                      defaultValue={submission.work}
                    />
                  </View>

                  {submission.files && submission.files.length !== 0 ? (
                    <View
                      style={[
                        styles.questionContainer,
                        {backgroundColor: '#ADD8E6'},
                      ]}>
                      <Text style={styles.header}>File submission(s)</Text>
                      {submission.files.map((item, index) => {
                        return (
                          <TouchableOpacity
                            style={styles.fileItem}
                            key={index}
                            onPress={() =>
                              handleDeleteFile(
                                submission.files[index],
                                submission.files,
                                text,
                                classId,
                                classwork,
                                userInfo,
                                setReload,
                              )
                            }>
                            <Text style={{alignSelf: 'center'}}>
                              {item.replace(filePath, '')}
                            </Text>
                            <IconRemove height={30} width={30} color={'red'} />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <></>
                  )}
                  {files && files.length !== 0 ? (
                    <Text style={styles.header}>Added files</Text>
                  ) : (
                    <></>
                  )}
                  {files &&
                    files.map((item, index) => {
                      return (
                        <TouchableOpacity
                          style={styles.fileItem}
                          key={index}
                          onPress={() => {
                            let filesCopy = [...files];
                            filesCopy.splice(index, 1);
                            setFiles(filesCopy);
                          }}>
                          <Text>{item.fileName}</Text>
                          <Text style={{marginRight: 5, color: 'red'}}>✖️</Text>
                        </TouchableOpacity>
                      );
                    })}
                  <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => openFile(setFiles)}>
                      <View style={styles.uploadView}>
                        <Text style={styles.uploadText}>Upload file </Text>
                        <IconUpload
                          style={styles.icon}
                          height={20}
                          width={20}
                          color={Colors.black}
                        />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={() =>
                        submit(
                          classId,
                          classwork,
                          files,
                          userInfo,
                          text,
                          submission,
                          setFiles,
                          setIsEdit,
                          setReload,
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
                <Text style={styles.header}>Answer/Comment</Text>
                <Text style={styles.item}>{submission.work}</Text>
              </View>

              {/* this is repeating code, honestly i should make it a component */}
              {submission.files ? (
                <View style={styles.questionContainer}>
                  <Text style={styles.header}>File submission(s)</Text>
                  <View style={styles.item}>
                    {submission.files.map((item, index) => {
                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.fileItem}
                          onPress={() => viewFile(item, classId, classwork)}>
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

const openFile = setFiles => {
  DocumentPicker.pick({
    type: [DocumentPicker.types.allFiles],
  })
    .then(res => {
      setFiles(prev => [
        ...prev,
        {fileName: res[0].name, uri: res[0].fileCopyUri},
      ]);
    })
    .catch(e => alert(e));
};

const submit = (
  classId,
  classwork,
  files,
  userInfo,
  text,
  submission,
  setFiles,
  setIsEdit,
  setReload,
) => {
  console.log('classid', classId, '\nclasswork', classwork, '\nfiles', files);
  const filePath = `${classId}/classworks/${classwork.id}/`;
  let urls = [];
  if (files.length !== 0) {
    for (let i in files) {
      const reference = storage().ref(filePath + files[i].fileName);
      reference
        .putFile(files[i].uri)
        .then(res => {
          urls.push(filePath + files[i].fileName);
          console.log('139');
          console.log('140', i, files.length, urls.length);
          if (urls.length === files.length) {
            console.log('141');
            console.log(urls);
            saveToDb(
              classId,
              classwork,
              urls,
              userInfo,
              text,
              submission,
              setFiles,
              setIsEdit,
              setReload,
            );
          }
        })
        .catch(e => {
          alert(e);
        });
    }
  } else {
    saveToDb(
      classId,
      classwork,
      urls,
      userInfo,
      text,
      submission,
      setFiles,
      setIsEdit,
      setReload,
    );
  }
};

const saveToDb = (
  classId,
  classwork,
  urls,
  userInfo,
  text,
  submission,
  setFiles,
  setIsEdit,
  setReload,
) => {
  const filePath = `${classId}/classworks/${classwork.id}/`;
  urls = urls.concat(submission.files ? submission.files : []);
  if (text != undefined && text != '' && urls.length !== 0) {
    // if student wrote something and added files (text at files parehas meron)
    console.log(
      '163 if student wrote something and added files (text at files parehas meron)',
      text,
      urls,
    );
    firestore()
      .collection(`classes/${classId}/classworks/${classwork.id}/submissions`)
      .doc(userInfo.id)
      .set({
        submittedAt: firestore.FieldValue.serverTimestamp(),
        files: urls,
        work: text,
      })
      .then(res => {
        console.log('success', res);
        setFiles([]);
        setIsEdit(false);
        setReload(true);
      })
      .catch(e => alert(e));
  } else if ((text == '' || text == undefined) && urls.length !== 0) {
    // if student did not write anything but submitted files (text wala, files meron)
    console.log(
      '185 if student did not write anything but submitted files (text wala, files meron)',
    );
    firestore()
      .collection(`classes/${classId}/classworks/${classwork.id}/submissions`)
      .doc(userInfo.id)
      .set({submittedAt: firestore.FieldValue.serverTimestamp(), files: urls})
      .then(res => {
        console.log('success', res);

        setFiles([]);
        setIsEdit(false);
        setReload(true);
      })
      .catch(e => alert(e));
  } else if (text != '' && text != undefined && urls.length === 0) {
    // if student did wrote something but did not submit files (text meron, files wala)
    console.log(
      '204 if student did wrote something but did not submit files (text meron, files wala)',
    );
    firestore()
      .collection(`classes/${classId}/classworks/${classwork.id}/submissions`)
      .doc(userInfo.id)
      .set({
        submittedAt: firestore.FieldValue.serverTimestamp(),
        work: text,
      })
      .then(res => {
        console.log('success', res);
        setIsEdit(false);
        setReload(true);
      })
      .catch(e => alert(e));
  } else {
    console.log('223');
    firestore()
      .collection(`classes/${classId}/classworks/${classwork.id}/submissions`)
      .doc(userInfo.id)
      .set({
        submittedAt: firestore.FieldValue.serverTimestamp(),
        work: '',
        files: [],
      })
      .then(res => {
        console.log('success', res);

        setIsEdit(false);
        setReload(true);
      })
      .catch(e => alert(e));
  }
};
const viewFile = (file, classId, classwork) => {
  const filePath = `${classId}/classworks/${classwork.id}/`;

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
          alert(error);
        });
    })
    .catch(e => alert(e));
};

const handleDeleteFile = (
  itemFilePath,
  submissionFiles,
  text,
  classId,
  classwork,
  userInfo,
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
      console.log('File deleted successfully');
      firestore()
        .collection(`classes/${classId}/classworks/${classwork.id}/submissions`)
        .doc(userInfo.id)
        .set({
          files: filesCopy,
          work: text ? text : '',
          submittedAt: firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          console.log('files updated successfully');
          setReload(true);
        })
        .catch(e => alert(e));
    })
    .catch(function (error) {
      console.error('Uh-oh, an error occurred!', error);
    });
};
const alert = e =>
  Alert.alert('Alert', `${e ? e : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => console.log('OK Pressed')},
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
    color: '#666',
  },
  header: {
    fontSize: 18,
    fontFamily: 'Lato-Regular',
    marginHorizontal: 15,
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
  fileItem: {
    justifyContent: 'space-between',
    backgroundColor: '#E8EAED',
    flexDirection: 'row',
    marginHorizontal: 15,
    marginVertical: 3,
    padding: 15,
    borderRadius: 10,
  },
  editButton: {
    backgroundColor: 'gold',
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 15,
    alignItems: 'center',
  },
  questionContainer: {
    backgroundColor: '#ADD8E6',
    borderRadius: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    paddingVertical: 10,
  },
});
export default ActivitySubmission;
