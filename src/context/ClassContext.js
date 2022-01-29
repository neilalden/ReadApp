import React, {useState, createContext, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {Alert} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ClassContext = createContext();

export default ClassContextProvider = props => {
  const [classList, setClassList] = useState([]);
  // FOR XLSX EXPORT
  const [classListGrades, setClassListGrades] = useState({});

  // TO KEEP TRACK OF WHAT CLASS IN THE CLASSLIST ARRAY IS OPEN
  const [classNumber, setClassNumber] = useState(0);

  // TO KEEP TRACK OF WHAT CLASSWORK IN THE CLASSWORKLIST ARRAY IS OPEN
  const [classworkNumber, setClassworkNumber] = useState(0);
  const [submissionListNumber, setSubmissionListNumber] = useState(0);
  return (
    <ClassContext.Provider
      value={{
        classList,
        setClassList,
        classNumber,
        setClassNumber,
        classworkNumber,
        setClassworkNumber,
        classListGrades,
        setClassListGrades,
        submissionListNumber,
        setSubmissionListNumber,
      }}>
      {props.children}
    </ClassContext.Provider>
  );
};

export const createLecture = (data, classList, classNumber) => {
  const classId = classList[classNumber].classId;
  firestore()
    .collection(`classes/${classId}/lectures`)
    .add(data)
    .then(() => {})
    .catch(e => alert(e, 'You may have disconnected'));
};

export const fetchLectures = (classNumber, classList, setClassList) => {
  NetInfo.fetch().then(state => {
    if (!state.isConnected) {
      getData('classList', setClassList);
    } else {
      const classId = classList[classNumber].classId;
      let classListCopy = [...classList];
      let lectures = [];
      firestore()
        .collection(`classes/${classId}/lectures`)
        .orderBy('createdAt', 'desc')
        .get()
        .then(documentSnapshot => {
          documentSnapshot.forEach(res => {
            lectures.push({
              id: res.id,
              title: res.data().title,
              instruction: res.data().instruction,
              files: res.data().files,
            });
          });

          for (const i in classListCopy) {
            if (
              classListCopy[classNumber].classId == classListCopy[i].classId
            ) {
              classListCopy[classNumber].lectures = lectures;
            }
          }
          setClassList(classListCopy);
          storeData('classList', {classList: classListCopy});
        })
        .catch(e => alert(e, 'You may have disconnected'));
    }
  });
};

export const fetchClassList = async (userInfo, setClassList) => {
  NetInfo.fetch().then(state => {
    if (!state.isConnected) {
      getData('classList', setClassList);
    } else {
      const classes = userInfo.classes;
      let classListTemp = [];
      for (let i in classes) {
        firestore()
          .collection('classes')
          .doc(classes[i])
          .get()
          .then(res => {
            const data = {
              classId: res.data().classId,
              classHeader: res.data().classHeader,
              subject: res.data().subject,
              section: res.data().section,
              students: res.data().students,
              teachers: res.data().teachers,
              queues: res.data().queues,
            };
            classListTemp.push(data);
            if (classListTemp.length === classes.length) {
              storeData('classList', {classList: classListTemp});
              setClassList(classListTemp);
            }
          })
          .catch(e => alert(e, 'You may have disconnected'));
      }
    }
  });
};

export const fetchClassworkList = (classNumber, classList, setClassList) => {
  NetInfo.fetch().then(state => {
    if (!state.isConnected) {
      getData('classList', setClassList);
    } else {
      const classId = classList[classNumber].classId;
      let classListCopy = [...classList];
      let classworkList = [];
      firestore()
        .collection(`classes/${classId}/classworks`)
        .orderBy('createdAt', 'desc')
        .get()
        .then(documentSnapshot => {
          documentSnapshot.forEach(res => {
            let questions = undefined;
            if (res.data().questions) {
              questions = shuffle(res.data().questions);
            }
            classworkList.push({
              id: res.id,
              title: res.data().title,
              deadline: res.data().deadline,
              closeOnDeadline: res.data().closeOnDeadline,
              instruction: res.data().instruction,
              points: res.data().points,
              isActivity: res.data().isActivity,
              files: res.data().files,
              questions: questions,
              pointsPerRight: res.data().pointsPerRight,
              pointsPerWrong: res.data().pointsPerWrong,
            });
          });

          for (const i in classListCopy) {
            if (
              classListCopy[classNumber].classId == classListCopy[i].classId
            ) {
              classListCopy[classNumber].classworkList = classworkList;
            }
          }
          setClassList(classListCopy);
          storeData('classList', {classList: classListCopy});
        })
        .catch(e => alert(e, 'You may have disconnected'));
    }
  });
};
export const fetchSubmissionList = (
  classNumber,
  classworkNumber,
  classList,
  setClassList,
) => {
  NetInfo.fetch()
    .then(state => {
      if (!state.isConnected) {
        getData('classList', setClassList);
      } else {
        const classworkId =
          classList[classNumber].classworkList[classworkNumber].id;
        const classId = classList[classNumber].classId;
        let classListCopy = [...classList];
        let submissionList = [];
        for (let i in classList[classNumber].students) {
          firestore()
            .collection(
              `classes/${classId}/classworks/${classworkId}/submissions`,
            )
            .doc(classList[classNumber].students[i].id)
            .get()
            .then(res => {
              let data = {};
              if (res.data()) {
                data = {
                  submittedBy: classList[classNumber].students[i],
                  submittedAt: res.data().submittedAt,
                  work: res.data().work,
                  files: res.data().files,
                  score: res.data().score,
                };
              } else {
                data = {submittedBy: classList[classNumber].students[i]};
              }
              submissionList.push(data);
              if (
                submissionList.length === classList[classNumber].students.length
              ) {
                for (const j in classListCopy) {
                  if (
                    classListCopy[classNumber].classId ==
                    classListCopy[j].classId
                  ) {
                    classListCopy[classNumber].classworkList[
                      classworkNumber
                    ].submissionList = submissionList;
                  }
                }
                setClassList(classListCopy);
                storeData('classList', {classList: classListCopy});
              }
            })
            .catch(e => alert(e, 'You may have disconnected'));
        }
      }
    })
    .catch(e => alert(e));
};

// ELSE IF ACCOUNT TYPE IS STUDENT, FETCH THE SUBMISSION OF THAT STUDENT
export const fetchSubmision = (
  classNumber,
  classworkNumber,
  classList,
  setClassList,
  userInfo,
) => {
  NetInfo.fetch().then(state => {
    if (!state.isConnected) {
      getData('classList', setClassList);
    } else {
      const classworkId =
        classList[classNumber].classworkList[classworkNumber].id;
      const classId = classList[classNumber].classId;
      const studenId = userInfo.id;
      let classListCopy = [...classList];
      let submission = {};
      firestore()
        .collection(`classes/${classId}/classworks/${classworkId}/submissions`)
        .doc(studenId)
        .get()
        .then(res => {
          if (res.data()) {
            submission = {
              submittedAt: res.data().submittedAt,
              work: res.data().work,
              score: res.data().score,
              files: res.data().files,
            };
          } else {
            submission = {};
          }
          classListCopy[classNumber].classworkList[classworkNumber].submission =
            submission;
          setClassList(classListCopy);
          storeData('classList', {classList: classListCopy});
        })
        .catch(e => alert(e, 'You may have disconnected'));
    }
  });
};

export const fetchPosts = (classNumber, classList, setClassList) => {
  NetInfo.fetch().then(state => {
    if (!state.isConnected) {
      getData('classList', setClassList);
    } else {
      const classId = classList[classNumber].classId;
      let classListCopy = [...classList];
      let posts = [];
      firestore()
        .collection(`classes/${classId}/posts`)
        .orderBy('createdAt', 'desc')
        .get()
        .then(documentSnapshot => {
          documentSnapshot.forEach(res => {
            posts.push({
              id: res.id,
              author: res.data().author,
              body: res.data().body,
              files: res.data().files,
              createdAt: res.data().createdAt,
              comments: res.data().comments,
            });
          });

          for (const i in classListCopy) {
            if (
              classListCopy[classNumber].classId == classListCopy[i].classId
            ) {
              classListCopy[classNumber].posts = posts;
            }
          }
          setClassList(classListCopy);
          storeData('classList', {classList: classListCopy});
        })
        .catch(e => alert(e, 'Fetch post error'));
    }
  });
};

export const createClasswork = (data, classList, classNumber) => {
  const classId = classList[classNumber].classId;
  firestore()
    .collection(`classes/${classId}/classworks`)
    .add(data)
    .then(() => {})
    .catch(e => alert(e, 'You may have disconnected'));
};

export const createPost = (data, classList, classNumber) => {
  const classId = classList[classNumber].classId;
  firestore()
    .collection(`classes/${classId}/posts`)
    .add(data)
    .then(() => {})
    .catch(e => alert(e, 'You may have disconnected'));
};

export const createComment = (postId, data, classList, classNumber) => {
  const classId = classList[classNumber].classId;
  firestore()
    .collection(`classes/${classId}/posts`)
    .doc(postId)
    .update({comments: data})
    .then()
    .catch(e => {
      alert(e.message, e.code);
    });
};

export const addPersonToQueue = (personInfo, classQueues) => {
  firestore()
    .collection(`queues`)
    .doc(personInfo.id)
    .get()
    .then(res => {
      if (!res.data()) {
        // if person has nt been queued once
        // add them to queue collecetion
        firestore()
          .collection(`queues`)
          .doc(personInfo.id)
          .set(personInfo)
          .then(() => {
            // add this reference to the class
            firestore()
              .collection(`classes`)
              .doc(personInfo.classes[0])
              .update({queues: classQueues})
              .then()
              .catch(e => {
                alert(e.message, e.code);
              });
          })
          .catch(e => alert(e.message, e.code));
      } else {
        // person has been queued before
        let queuedClasses = res.data().classes;
        firestore()
          .collection(`queues`)
          .doc(personInfo.id)
          .update({classes: queuedClasses.concat(personInfo.classes)})
          .then(() => {
            // add this reference to the class
            firestore()
              .collection(`classes`)
              .doc(personInfo.classes[0])
              .update({queues: classQueues})
              .then()
              .catch(e => alert(e.message, e.code));
          })
          .catch(e => alert(e.message, e.code));
      }
    })
    .catch(e => alert(e, 'Line'));
};

const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    alert(e.message);
  }
};
const getData = async (key, setFunction) => {
  AsyncStorage.getItem(key)
    .then(jsonValue => {
      setFunction(JSON.parse(jsonValue).classList);
    })
    .catch(e => alert(e.message));
};
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

const alert = (msg, title = 'Error') => {
  Alert.alert(`${title}`, `${msg ? msg : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => true},
  ]);
};
