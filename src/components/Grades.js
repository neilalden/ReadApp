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
import RNFS, {writeFile} from 'react-native-fs';
import XLSX from 'xlsx';
import IconDownload from '../../assets/download.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Table, Row} from 'react-native-table-component';

const Grades = () => {
  const [data, setData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [tableHeader, setTableHeader] = useState({
    tableHead: [],
    widthArr: [],
  });
  const [tableData, setTableData] = useState([]);
  const {
    classNumber,
    classList,
    setClassList,
    classListGrades,
    setClassListGrades,
  } = useContext(ClassContext);
  const history = useHistory();
  useEffect(() => {
    const classworkList = classList[classNumber].classworkList;
    const students = classList[classNumber].students;
    const classId = classList[classNumber].classId;
    const renderData = () => {
      const grades = classListGrades[classId];
      setData(grades);
      // setting the table header
      let copyTableHeader = {...tableHeader};
      const headerArr = Object.keys(grades[0]);
      const headerWidArr = [];
      for (const i in headerArr) {
        const val = headerArr[i].length * 8;
        headerWidArr.push(val > 100 ? 100 : val);
      }
      copyTableHeader.tableHead = headerArr;
      copyTableHeader.widthArr = headerWidArr;
      setTableHeader(copyTableHeader);
      // setting the table data
      setTableData([]);
      for (const i in grades) {
        const temp = [];
        for (const j in Object.keys(grades[i])) {
          temp.push(grades[i][Object.keys(grades[i])[j]]);
        }
        setTableData(prev => [...prev, temp]);
      }
      return;
    };
    if (classListGrades[classId]) {
      // Data is loaded before
      setIsLoaded(true);
      renderData();
    }

    const getAVG = data => {
      let newData = [];
      for (const i in data) {
        const keys = Object.keys(data[i]);
        let score = 0;
        for (const j in keys) {
          if (keys[j] !== 'student') {
            score += data[i][keys[j]];
          }
        }
        score /= keys.length - 1;
        let temp = {};
        temp.student = data[i].student;
        temp.average = score;
        for (const j of Object.keys(data[i])) {
          temp[j] = data[i][j];
        }
        newData.push(temp);
      }
      return newData;
    };

    for (const i in classworkList) {
      if (!classworkList[i].submissionList) {
        fetchSubmissionList(classNumber, i, classList, setClassList);
      } else {
        const submissionList = classworkList[i].submissionList;
        for (const j in submissionList) {
          for (const k in data) {
            if (data[k].student === submissionList[j].submittedBy.id) {
              let copyData = [...data];
              const work_title = `${classworkList[i].title} (${classworkList[i].points} points)`;
              const score = submissionList[j].score || 0;
              let obj = Object.assign(copyData[k], {[work_title]: score});
              copyData.splice(k, 1, obj);
              setData(copyData);
            }
            if (data.length == students.length) {
              if (
                Object.keys(data[data.length - 1]).length - 1 ===
                classworkList.length
              ) {
                let copyClassListGrades = {...classListGrades};

                let newData = [];
                let copyData = [...data];
                for (const i in copyData) {
                  const keys = Object.keys(copyData[i]);
                  let score = 0;
                  for (const j in keys) {
                    if (keys[j] !== 'student') {
                      score += copyData[i][keys[j]];
                    }
                  }
                  score /= keys.length - 1;
                  let temp = {};
                  temp.student = copyData[i].student;
                  temp.average = score;
                  for (const j of Object.keys(copyData[i])) {
                    temp[j] = copyData[i][j];
                  }
                  newData.push(temp);
                }
                copyClassListGrades[classId] = newData;
                setData(newData);
                setClassListGrades(copyClassListGrades);
                setIsLoaded(true);
              }
            }
          }
        }
      }
    }
    // get the students
    for (const i in students) {
      for (const j in data) {
        if (data[j].student == students[i].id) return;
      }
      setData(prev => [...prev, {student: students[i].id}]);
    }
    // TO STOP THE BACK BUTTON FROM CLOSING THE APP
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/ClassList');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [classList, isLoaded]);

  if (
    !classList[classNumber].students ||
    classList[classNumber].students.length == 0
  ) {
    return (
      <>
        <ClassroomHeader
          subject={classList[classNumber].subject}
          isStudent={false}
        />
        <Text style={styles.subtitle}>No students to grade yet</Text>
      </>
    );
  }
  if (!isLoaded) {
    return (
      <>
        <ClassroomHeader
          subject={classList[classNumber].subject}
          isStudent={false}
        />
        <Text style={styles.subtitle}>Loading...</Text>
      </>
    );
  }
  return (
    <>
      <ClassroomHeader
        subject={classList[classNumber].subject}
        isStudent={false}
      />
      <View style={styles.container}>
        <ScrollView horizontal={true}>
          <View>
            <Table borderStyle={{borderWidth: 1}}>
              <Row
                data={tableHeader.tableHead}
                widthArr={tableHeader.widthArr}
                style={styles.header}
                textStyle={styles.text}
              />
            </Table>
            <ScrollView style={styles.dataWrapper}>
              <Table borderStyle={{borderWidth: 1}}>
                {tableData &&
                  tableData.map((rowData, index) => (
                    <Row
                      key={index}
                      data={rowData}
                      widthArr={tableHeader.widthArr}
                      style={[
                        styles.row,
                        index % 2 && {backgroundColor: '#ebf6f9'},
                      ]}
                      textStyle={styles.text}
                    />
                  ))}
              </Table>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
      <TouchableOpacity
        style={
          isLoaded
            ? styles.saveButton
            : [styles.saveButton, {backgroundColor: '#ccc'}]
        }
        disabled={!isLoaded}
        onPress={() => {
          const fileName = `${classList[classNumber].subject}-${classList[classNumber].section}.xlsx`;
          saveFile(fileName, data);
        }}>
        <Text style={styles.marginH5}>Save file</Text>
        <IconDownload
          style={styles.marginH5}
          height={20}
          width={20}
          color={Colors.black}
        />
      </TouchableOpacity>
    </>
  );
};
const alert = (title = 'Error', msg = `something's wrong`) =>
  Alert.alert(title, msg, [{text: 'OK', onPress: () => true}]);
const saveFile = (fileName = 'ReadApp.xlsx', data) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const wbout = XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});
  const file = RNFS.ExternalStorageDirectoryPath + '/' + fileName;
  writeFile(file, wbout, 'ascii')
    .then(() => {
      alert(
        'File saved!',
        `Look for the file "${fileName}" in your device storage`,
      );
    })
    .catch(e => {
      alert('Error', e);
    });
};
const styles = StyleSheet.create({
  saveButton: {
    marginVertical: 5,
    padding: 5,
    borderRadius: 10,
    width: 250,
    flexDirection: 'row',
    backgroundColor: '#ADD8E6',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  marginH5: {
    marginHorizontal: 5,
  },
  container: {
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  header: {
    height: 50,
    backgroundColor: '#3ca1c3',
  },
  text: {
    textAlign: 'center',
    fontWeight: '100',
    fontSize: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
    color: '#ccc',
  },
  dataWrapper: {marginTop: -1},
  row: {height: 40, backgroundColor: '#c4e3ed'},
});
export default Grades;
