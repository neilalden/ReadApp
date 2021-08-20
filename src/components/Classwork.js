import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import ClassroomHeader from './ClassroomHeader';
import storage from '@react-native-firebase/storage';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
const Classwork = ({classroomId, userInfo, classworkInfo, courseCode}) => {
  const [classwork, setClasswork] = useState({});
  const [classworkList, setClassworkList] = useState([]);
  const [files, setFiles] = useState([]);
  const [text, onChangeText] = useState('');
  const [reload, setReload] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  useEffect(() => {
    console.log('classwork 27', classworkInfo);
    if (userInfo.isStudent) {
      fetchStudentClasswork(
        classworkInfo.id,
        classroomId,
        userInfo.id,
        setClasswork,
      );
    } else {
      fetchClassworkList(classworkInfo.id, classroomId, setClassworkList);
    }
  }, [reload]);
  return (
    <>
      <ClassroomHeader
        classroomId={courseCode}
        backTo={'/Classroom'}
        isStudent={userInfo.isStudent}
      />

      <ScrollView>
        {!userInfo.isStudent ? (
          // if user is a teacher show component ViewClassworkList
          <ViewClassworkList classworkList={classworkList} />
        ) : classworkInfo.isActivity ? (
          // if user is a student and the classwork is an activity show component ViewStudentActivity
          <ViewStudentActivity
            userInfo={userInfo}
            classworkInfo={classworkInfo}
            classwork={classwork}
            classroomId={classroomId}
            files={files}
            setFiles={setFiles}
            text={text}
            onChangeText={onChangeText}
            reload={reload}
            setReload={setReload}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
          />
        ) : (
          // if user is a student and the classwork is a quiz show component ViewStudentQuiz
          <ViewStudentQuiz
            userInfo={userInfo}
            classworkInfo={classworkInfo}
            classwork={classwork}
            classroomId={classroomId}
            userAnswers={userAnswers}
            setUserAnswers={setUserAnswers}
            reload={reload}
            setReload={setReload}
          />
        )}
      </ScrollView>
    </>
  );
};

const getPathForFirebaseStorage = async uri => {
  if (Platform.OS === 'ios') {
    return uri;
  }
  const stat = await RNFetchBlob.fs.stat(uri);
  return stat.path;
};

// if user is a student and the classwork is an activity, show this
const ViewStudentActivity = ({
  userInfo,
  classworkInfo,
  classwork,
  classroomId,
  files,
  setFiles,
  text,
  onChangeText,
  reload,
  setReload,
  isEdit,
  setIsEdit,
}) => {
  const filePath = `${classroomId}/classworks/${classworkInfo.id}/`;

  const openFile = () => {
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

  const submit = () => {
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
              saveToDb(urls);
            }
          })
          .catch(e => {
            alert(e);
          });
      }
    } else {
      saveToDb(urls);
    }
  };

  const saveToDb = urls => {
    urls = urls.concat(classwork.files ? classwork.files : []);
    if (text != undefined && text != '' && urls.length !== 0) {
      // if student wrote something and added files (text at files parehas meron)
      console.log(
        '163 if student wrote something and added files (text at files parehas meron)',
        text,
        urls,
      );
      firestore()
        .collection(
          `classes/${classroomId}/classworks/${classworkInfo.id}/submissions`,
        )
        .doc(userInfo.id)
        .set({
          date: firestore.FieldValue.serverTimestamp(),
          files: urls,
          work: text,
        })
        .then(res => {
          console.log('success', res);
          setFiles([]);
          setIsEdit(false);
          setReload(!reload);
        })
        .catch(e => alert(e));
    } else if ((text == '' || text == undefined) && urls.length !== 0) {
      // if student did not write anything but submitted files (text wala, files meron)
      console.log(
        '185 if student did not write anything but submitted files (text wala, files meron)',
      );
      firestore()
        .collection(
          `classes/${classroomId}/classworks/${classworkInfo.id}/submissions`,
        )
        .doc(userInfo.id)
        .set({date: firestore.FieldValue.serverTimestamp(), files: urls})
        .then(res => {
          console.log('success', res);

          setFiles([]);
          setIsEdit(false);
          setReload(!reload);
        })
        .catch(e => alert(e));
    } else if (text != '' && text != undefined && urls.length === 0) {
      // if student did wrote something but did not submit files (text meron, files wala)
      console.log(
        '204 if student did wrote something but did not submit files (text meron, files wala)',
      );
      firestore()
        .collection(
          `classes/${classroomId}/classworks/${classworkInfo.id}/submissions`,
        )
        .doc(userInfo.id)
        .set({
          date: firestore.FieldValue.serverTimestamp(),
          work: text,
        })
        .then(res => {
          console.log('success', res);

          setIsEdit(false);
          setReload(!reload);
        })
        .catch(e => alert(e));
    } else {
      console.log('223');
      firestore()
        .collection(
          `classes/${classroomId}/classworks/${classworkInfo.id}/submissions`,
        )
        .doc(userInfo.id)
        .set({
          date: firestore.FieldValue.serverTimestamp(),
          work: '',
          files: [],
        })
        .then(res => {
          console.log('success', res);

          setIsEdit(false);
          setReload(!reload);
        })
        .catch(e => alert(e));
    }
  };
  const viewFile = file => {
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

  const handleDeleteFile = (pathFile, submissionFiles) => {
    for (let i in submissionFiles) {
      if (pathFile == submissionFiles[i]) submissionFiles.splice(i, 1);
    }
    const desertRef = storage().ref(pathFile);
    desertRef
      .delete()
      .then(function () {
        console.log('File deleted successfully');
        firestore()
          .collection(
            `classes/${classroomId}/classworks/${classworkInfo.id}/submissions`,
          )
          .doc(userInfo.id)
          .set({files: submissionFiles, work: text})
          .then(() => {
            console.log('files updated successfully');
            setReload(!reload);
          })
          .catch(e => alert(e));
      })
      .catch(function (error) {
        console.error('Uh-oh, an error occurred!', error);
      });
  };

  return (
    <View>
      <View>
        <Text style={styles.header}>Instruction</Text>
        <Text style={styles.item}>{classworkInfo.instruction}</Text>
      </View>
      <View>
        <Text style={styles.header}>Score</Text>
        <Text style={styles.item}>
          {classwork.score ? classwork.score : 'no grades yet'}
        </Text>
      </View>

      {/* Student activity screen has three (3) states */}
      {/* > Student has not complied yet (allows user to send their submissions) */}
      {/* > Student has complied but work is not yet graded (allows users to edit and view their submission) */}
      {/* > Student has complied and their work is graded (only allows the user to view their score and work) */}

      {(() => {
        if (
          !classwork.work &&
          (!classwork.files || classwork.files.length === 0)
        ) {
          // student is yet to comply
          return (
            <>
              <Text style={styles.header}>Answer/Comment</Text>
              <KeyboardAvoidingView>
                <TextInput
                  style={styles.item}
                  placeholder="type your answer or comment here.."
                  onChangeText={val => onChangeText(val)}
                  value={text}
                />
              </KeyboardAvoidingView>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => openFile()}>
                  <Text>Upload file 📤</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => submit()}>
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
        } else if ((classwork.work || classwork.files) && !classwork.score) {
          // student has complied but not yet graded
          // TODO: edit submission
          return (
            <View>
              {isEdit ? (
                // student is editting their submission
                <>
                  <Text style={styles.header}>Answer/Comment</Text>
                  <TextInput
                    style={styles.item}
                    value={text}
                    onChangeText={onChangeText}
                    defaultValue={classwork.work}
                  />
                  {classwork.files && classwork.files.length !== 0 ? (
                    <View>
                      <Text style={styles.header}>File submission(s)</Text>
                      <View style={styles.item}>
                        {classwork.files.map((item, index) => {
                          return (
                            <TouchableOpacity
                              style={styles.fileItem}
                              key={index}
                              onPress={() =>
                                handleDeleteFile(
                                  classwork.files[index],
                                  classwork.files,
                                )
                              }>
                              <Text>{item.replace(filePath, '')}</Text>
                              <Text style={{marginRight: 5, color: 'red'}}>
                                ✖️
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ) : (
                    <></>
                  )}
                  {files.length !== 0 ? (
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
                      onPress={() => openFile()}>
                      <Text>Upload file 📤</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={() => submit()}>
                      <Text>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.submitButton, {backgroundColor: 'gold'}]}
                      onPress={() => {
                        setReload(!reload);
                        setIsEdit(false);
                      }}>
                      <Text>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                // student is viewing their ungraded submission
                <>
                  {classwork.work ? (
                    <>
                      <Text style={styles.header}>Answer/Comment</Text>
                      <Text style={styles.item}>{classwork.work}</Text>
                    </>
                  ) : (
                    <></>
                  )}
                  {classwork.files && classwork.files.length !== 0 ? (
                    <View>
                      <Text style={styles.header}>File submission(s)</Text>
                      <View style={styles.item}>
                        {classwork.files.map((item, index) => {
                          return (
                            <TouchableOpacity
                              key={index}
                              style={styles.fileItem}
                              onPress={() => viewFile(item)}>
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
                      onChangeText(classwork.work);
                      setIsEdit(true);
                    }}>
                    <Text>Edit</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          );
        } else if (classwork.score) {
          // student has complied and graded
          return (
            <>
              <View>
                <Text style={styles.header}>Answer/Comment</Text>
                <Text style={styles.item}>{classwork.work}</Text>
              </View>

              {/* this is repeating code, honestly i should make it a component */}
              {classwork.files ? (
                <View>
                  <Text style={styles.header}>File submission(s)</Text>
                  <View style={styles.item}>
                    {classwork.files.map((item, index) => {
                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.fileItem}
                          onPress={() => viewFile(item)}>
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

// if user is a student and the classwork is a quiz, show this
const ViewStudentQuiz = ({
  userInfo,
  classworkInfo,
  classwork,
  classroomId,
  userAnswers,
  setUserAnswers,
  reload,
  setReload,
}) => {
  const handleAnswer = (value, index) => {
    let copyOfUserAnswers = {...userAnswers};
    copyOfUserAnswers[index] = value;
    setUserAnswers(copyOfUserAnswers);
  };
  const handleFinishQuiz = () => {
    if (Object.keys(userAnswers).length !== classworkInfo.questions.length) {
      alert('Please answer every question');
    } else {
      for (const [key, value] of Object.entries(userAnswers)) {
        if (value == '') {
          const qn = parseInt(key) + 1;
          alert(`You have'nt answered question number ${qn}`);
          return;
        }
      }
      console.log('student has answered every question');
      let score = 0;
      for (const i in classworkInfo.questions) {
        score =
          classworkInfo.questions[i]['answer'] === userAnswers[i]
            ? score + 1
            : score;
      }
      firestore()
        .collection(
          `classes/${classroomId}/classworks/${classworkInfo.id}/submissions`,
        )
        .doc(userInfo.id)
        .set({
          work: userAnswers,
          score: score,
        })
        .then(res => {
          console.log('success', res);

          setReload(!reload);
        })
        .catch(e => alert(e));
    }
  };
  return (
    <View>
      <View>
        <Text style={styles.header}>Instruction</Text>
        <Text style={styles.item}>{classworkInfo.instruction}</Text>
      </View>
      <View
        style={{
          paddingBottom: 5,
          borderBottomWidth: 2,
          borderBottomColor: '#666',
        }}>
        <Text style={styles.header}>Score</Text>
        <Text style={styles.item}>
          {classwork.score
            ? `${classwork.score}/${Object.keys(classwork.work).length}`
            : 'no grades yet'}
        </Text>
      </View>

      {/* Student Quiz screen has two (2) states */}
      {/* > Student has taken the quiz */}
      {/* > Student has NOT taken the quiz */}

      {(() => {
        if (classwork.score) {
          return (
            <ScrollView>
              {classworkInfo.questions.map((item, index) => {
                return (
                  <View key={index} style={styles.questionContainer}>
                    <Text style={styles.header}>
                      Question number {index + 1}
                    </Text>
                    <Text style={styles.item}>{item[index + 1]}</Text>
                    <View>
                      <Text style={styles.header}>Correct answer</Text>
                      <Text style={styles.item}>{item['answer']}</Text>
                    </View>
                    <View>
                      <Text style={styles.header}>Your answer</Text>
                      <Text
                        style={[
                          styles.item,
                          item['answer'] == classwork.work[index]
                            ? {backgroundColor: 'forestgreen'}
                            : {backgroundColor: 'crimson'},
                        ]}>
                        {classwork.work[index]}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          );
        } else {
          return (
            <>
              <ScrollView>
                {classworkInfo.questions.map((item, index) => {
                  let options = item.options
                    ? [...item.options, item.answer]
                    : undefined;
                  if (options) options.sort();
                  return (
                    <View key={index} style={styles.questionContainer}>
                      <Text style={styles.header}>
                        Question number {index + 1}
                      </Text>
                      <Text style={styles.item}>{item[index + 1]}</Text>
                      {options ? (
                        <View style={styles.optionsContainer}>
                          {options.map((itm, idx) => {
                            return (
                              <TouchableOpacity
                                key={idx}
                                style={[
                                  styles.item,
                                  userAnswers[index] &&
                                  userAnswers[index] == itm
                                    ? {
                                        borderColor: 'teal',
                                        borderWidth: 3,
                                        padding: 12,
                                      }
                                    : {},
                                ]}
                                onPress={() => handleAnswer(itm, index)}>
                                <Text>{itm}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      ) : (
                        <TextInput
                          placeholder="Write your answers here.."
                          style={styles.item}
                          onChangeText={text => handleAnswer(text, index)}
                        />
                      )}
                    </View>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                style={[styles.editButton, {backgroundColor: 'teal'}]}
                onPress={() => handleFinishQuiz()}>
                <Text>Finish</Text>
              </TouchableOpacity>
            </>
          );
        }
      })()}
    </View>
  );
};

// if the user is a teacher show the list of every students with a status of submitted or missing
const ViewClassworkList = ({classworkList}) => {
  return (
    <>
      <Text style={styles.header}>list of student works</Text>
      {classworkList &&
        classworkList.map((item, index) => {
          return (
            <View key={index} style={styles.item}>
              <Text>{item.id}</Text>
              <Text style={styles.itemSubtitle}>
                {item.didComply ? 'Complied' : 'Missing'}
              </Text>
            </View>
          );
        })}
    </>
  );
};

// if user is a student, app will fetch the student's work(s) and score
const fetchStudentClasswork = (
  classworkId,
  classroomId,
  studenId,
  setClasswork,
) => {
  firestore()
    .collection(`classes/${classroomId}/classworks/${classworkId}/submissions`)
    .doc(studenId)
    .get()
    .then(res => {
      setClasswork({
        work: res.data().work,
        score: res.data().score,
        files: res.data().files,
      });
    })
    .catch(e => alert(e));
};

// if user is a teacher, app will fetch all students who submitted
const fetchClassworkList = (classworkId, classroomId, setClassList) => {
  console.log('727');
  firestore()
    .collection(`classes/${classroomId}/classworks/${classworkId}/submissions`)
    .get()
    .then(querySS => {
      setClassList([]);
      querySS.forEach(docuSS => {
        let didComply = true;
        if (docuSS.data().files || docuSS.data().work) {
          if (docuSS.data().files !== [] || docuSS.data().work !== '')
            didComply = true;
          else {
            didComply = false;
          }
        } else {
          didComply = false;
        }
        setClassList(prev => [
          ...prev,
          {
            id: docuSS.id,
            didComply:
              docuSS.data().work !== undefined ||
              docuSS.data().files !== undefined,
          },
        ]);
      });
    })
    .catch(e => alert(e));
};

const alert = e =>
  Alert.alert('Error', `${e ? e : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => console.log('OK Pressed')},
  ]);

const styles = StyleSheet.create({
  item: {
    justifyContent: 'space-between',
    backgroundColor: '#E8EAED',
    fontFamily: 'monospace',
    marginHorizontal: 5,
    marginVertical: 3,
    borderRadius: 10,
    padding: 15,
  },
  itemSubtitle: {
    fontFamily: 'monospace',
    marginRight: 5,
    color: '#666',
  },
  header: {
    fontSize: 18,
    fontFamily: 'monospace',
    margin: 5,
  },
  questionContainer: {
    borderBottomWidth: 2,
    borderBottomColor: '#666',
    margin: 5,
    paddingBottom: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },
  uploadButton: {
    borderColor: 'teal',
    borderWidth: 3,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: 'teal',
    marginHorizontal: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  fileItem: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderColor: '#ccc',
    margin: 4,
    padding: 4,
    borderWidth: 3,
    borderRadius: 5,
  },
  editButton: {
    alignSelf: 'center',
    backgroundColor: 'gold',
    borderRadius: 5,
    marginVertical: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
export default Classwork;
