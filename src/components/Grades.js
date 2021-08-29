import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  BackHandler,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {useHistory} from 'react-router';
import {ClassContext, fetchSubmissionList} from '../context/ClassContext';
import ClassroomHeader from './ClassroomHeader';
import RNFS, {writeFile, readFile} from 'react-native-fs';
import XLSX from 'xlsx';

const Grades = () => {
  const [data, setData] = useState([]);
  const {classNumber, classList, setClassList} = useContext(ClassContext);
  const history = useHistory();
  useEffect(() => {
    const classworkList = classList[classNumber].classworkList;
    for (const i in classworkList) {
      if (!classworkList[i].submissionList) {
        fetchSubmissionList(classNumber, i, classList, setClassList);
      } else {
        const submissionList = classworkList[i].submissionList;
        for (const j in submissionList) {
          for (const k in data) {
            if (data[k].student_id === submissionList[j].submittedBy.id) {
              let copyData = [...data];
              const work_title = classworkList[i].title;
              const score = submissionList[j].score || 0;
              let obj = Object.assign(copyData[k], {[work_title]: score});
              copyData.splice(k, 1, obj);
              setData(copyData);
            }
          }
        }
      }
    }
    // get the students
    const students = classList[classNumber].students;
    for (const i in students) {
      for (const j in data) {
        if (data[j].student_id == students[i].id) return;
      }
      setData(prev => [...prev, {student_id: students[i].id}]);
    }
    // TO STOP THE BACK BUTTON FROM CLOSING THE APP
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/ClassList');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [classList, data]);

  return (
    <>
      <ClassroomHeader
        subject={classList[classNumber].subject}
        isStudent={false}
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          const fileName = `/${classList[classNumber].subject}-${classList[classNumber].section}.xlsx`;
          saveFile(fileName, data);
        }}>
        <Text>Save file</Text>
      </TouchableOpacity>
      <ScrollView>
        {data.map((item, index) => {
          return (
            <View key={index}>
              {Object.entries(item).map((itm, idx) => {
                return (
                  <View key={idx}>
                    <Text>
                      {itm[0]} = {itm[1]}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </>
  );
};
const alert = (title = 'Error', msg = `something's wrong`) =>
  Alert.alert(title, msg, [
    {text: 'OK', onPress: () => console.log('OK Pressed')},
  ]);
const saveFile = (fileName = 'ReadApp.xlsx', data) => {
  console.log(data);
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const wbout = XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});
  const file = RNFS.ExternalStorageDirectoryPath + fileName;
  writeFile(file, wbout, 'ascii')
    .then(() => {
      alert(
        'File saved!',
        `Look for the file ${fileName} in your device storage`,
      );
    })
    .catch(e => {
      console.error(e);
    });
};
const styles = StyleSheet.create({
  saveButton: {
    marginVertical: 5,
    backgroundColor: '#ADD8E6',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
});
export default Grades;
