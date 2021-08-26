import React, {useState, createContext} from 'react';
import firestore from '@react-native-firebase/firestore';

export const ClassContext = createContext();

export default ClassContextProvider = props => {
  const [classList, setClassList] = useState([]);

  // TO KEEP TRACK OF WHAT CLASS IN THE CLASSLIST ARRAY IS OPEN
  const [classNumber, setClassNumber] = useState(0);

  // TO KEEP TRACK OF WHAT CLASSWORK IN THE CLASSWORKLIST ARRAY IS OPEN
  const [classworkNumber, setClassworkNumber] = useState(0);

  return (
    <ClassContext.Provider
      value={{
        classList,
        setClassList,
        classNumber,
        setClassNumber,
        classworkNumber,
        setClassworkNumber,
      }}>
      {props.children}
    </ClassContext.Provider>
  );
};

export const fetchClassList = (userInfo, setClassList) => {
  console.log('FETCHING CLASSES...');
  const classes = userInfo.classes;
  for (let i in classes) {
    firestore()
      .collection('classes')
      .doc(classes[i])
      .get()
      .then(res => {
        setClassList(prev => [
          ...prev,
          {
            classId: res.data().classId,
            classCode: res.data().classCode,
            subject: res.data().subject,
            section: res.data().section,
            students: res.data().students,
            teachers: res.data().teachers,
          },
        ]);
      })
      .catch(e => console.error('error in fetching classes', e));
  }
};

export const fetchClassworkList = (classNumber, classList, setClassList) => {
  console.log('FETCHING CLASSWORKS...');

  const classId = classList[classNumber].classId;
  let classListCopy = [...classList];
  let classworkList = [];

  firestore()
    .collection(`classes/${classId}/classworks`)
    .get()
    .then(documentSnapshot => {
      documentSnapshot.forEach(res => {
        classworkList.push({
          id: res.id,
          title: res.data().title,
          instruction: res.data().instruction,
          deadline: res.data().deadline,
          isActivity: res.data().isActivity,
          questions: res.data().questions,
        });
      });

      for (const i in classListCopy) {
        if (classListCopy[classNumber].classId == classListCopy[i].classId) {
          classListCopy[classNumber].classworkList = classworkList;
        }
      }
      setClassList(classListCopy);
    })
    .catch(e => console.error('error in fetching classworks', e));
};

// IF ACCOUNT TYPE IS TEACHER, FETCH ALL SUBMISSIONS
export const fetchSubmissionList = (
  classNumber,
  classworkNumber,
  classList,
  setClassList,
) => {
  const classworkId = classList[classNumber].classworkList[classworkNumber].id;
  const classId = classList[classNumber].classId;
  let classListCopy = [...classList];
  let submissionList = [];
  console.log('FETCHING CLASSWORK SUBMISSIONS...');
  for (let i in classList[classNumber].students) {
    firestore()
      .collection(`classes/${classId}/classworks/${classworkId}/submissions`)
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
          };
        } else {
          data = {submittedBy: classList[classNumber].students[i]};
        }
        submissionList.push(data);
        if (submissionList.length === classList[classNumber].students.length) {
          for (const j in classListCopy) {
            if (
              classListCopy[classNumber].classId == classListCopy[j].classId
            ) {
              classListCopy[classNumber].classworkList[
                classworkNumber
              ].submissionList = submissionList;
            }
          }
          setClassList(classListCopy);
        }
      })
      .catch(e =>
        console.error('error in fetching classwork submission list', e),
      );
  }
};

// ELSE IF ACCOUNT TYPE IS STUDENT, FETCH THE SUBMISSION OF THAT STUDENT
export const fetchSubmision = (
  classNumber,
  classworkNumber,
  classList,
  setClassList,
  userInfo,
) => {
  console.log('FETCHING CLASSWORK SUBMISSION...');
  const classworkId = classList[classNumber].classworkList[classworkNumber].id;
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
    })
    .catch(e =>
      console.error('error in fetching user classwork submission', e),
    );
};
