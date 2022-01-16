import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  BackHandler,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  PermissionsAndroid,
} from 'react-native';
import {useHistory} from 'react-router';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Table, Row} from 'react-native-table-component';
import XLSX from 'xlsx';
import RNFS, {writeFile} from 'react-native-fs';
import IconDownload from '../../../assets/download.svg';
import ClassroomHeader from '../general/ClassroomHeader';
import ClassroomNav from '../general/ClassroomNav';
import {ClassContext, fetchSubmissionList} from '../../context/ClassContext';

const GradesPage = ({userInfo}) => {
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

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    wait(500).then(() => setRefreshing(false));
  }, []);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };

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

    const getAVG = data => {
      let newData = [];
      for (const i in data) {
        const keys = Object.keys(data[i]);
        let score = 0;
        for (const j in keys) {
          if (keys[j] !== 'Student') {
            score += data[i][keys[j]];
          }
        }
        score /= keys.length - 1;
        let temp = {};
        temp.Student = data[i].Student;
        temp.Average = score.toFixed(2);
        for (const j of Object.keys(data[i])) {
          temp[j] = data[i][j];
        }
        newData.push(temp);
      }
      return newData;
    };
    if (classListGrades[classId]) {
      // Data is loaded before
      setIsLoaded(true);
      // renderData();
    }
    return;
    for (const i in classworkList) {
      if (!classworkList[i].submissionList) {
        fetchSubmissionList(classNumber, i, classList, setClassList);
      } else {
        const submissionList = classworkList[i].submissionList;
        for (const j in submissionList) {
          for (const k in data) {
            if (data[k].Student === submissionList[j].submittedBy.id) {
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

                const newData = getAVG(data);
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
        if (data[j].Student == students[i].id) return;
      }
      setData(prev => [...prev, {Student: students[i].id}]);
    }
    // TO STOP THE BACK BUTTON FROM CLOSING THE APP
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/ClassList');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [classList, isLoaded, refreshing]);

  if (
    !classList[classNumber].students ||
    classList[classNumber].students.length == 0
  ) {
    return (
      <>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <ClassroomHeader
            subject={classList[classNumber].subject}
            section={classList[classNumber].section}
          />
          <Text style={styles.subtitle}>No students to grade yet</Text>
        </ScrollView>

        <ClassroomNav isStudent={false} />
      </>
    );
  }
  if (!isLoaded) {
    return (
      <>
        <ScrollView
          style={{backgroundColor: '#fff'}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <ClassroomHeader
            subject={classList[classNumber].subject}
            section={classList[classNumber].section}
          />
          <Text style={styles.subtitle}>Loading, please wait</Text>
        </ScrollView>

        <ClassroomNav isStudent={false} />
      </>
    );
  }
  return (
    <>
      <ClassroomHeader
        subject={classList[classNumber].subject}
        section={classList[classNumber].section}
      />
      <View style={styles.container}>
        <ScrollView
          style={{backgroundColor: '#fff'}}
          horizontal={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
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
        style={styles.saveButton}
        disabled={!isLoaded}
        onPress={() => {
          const fileName = `${classList[classNumber].subject}-${classList[classNumber].section}.xlsx`;
          PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          )
            .then(res => {
              if (res) {
                saveFile(fileName, data);
              } else {
                requestStoragePermission(fileName, data);
              }
            })
            .catch(e => alert('Alert', `${e}`));
        }}>
        <Text style={styles.marginH5}>Save grades as excel file</Text>
        <IconDownload
          style={styles.marginH5}
          height={20}
          width={20}
          color={Colors.black}
        />
      </TouchableOpacity>

      <ClassroomNav isStudent={false} />
    </>
  );
};
const alert = (title = 'Alert', msg = `something's wrong`) =>
  Alert.alert(title, `${msg}`, [{text: 'OK', onPress: () => true}]);

const saveFile = (fileName = 'ReadApp.xlsx', data) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const wbout = XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});
  const file = RNFS.ExternalStorageDirectoryPath + '/' + fileName;
  writeFile(file, wbout, 'ascii')
    .then(() => {
      alert('File saved!', `Look for the file "${fileName}" in your storage`);
    })
    .catch(e => {
      alert('Error', `${e}`);
    });
};

const requestStoragePermission = async (fileName, data) => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'ReadApp Storage Permission',
        message:
          'ReadApp needs access to your storage ' +
          'so you can save an excel file of your students grades',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      saveFile(fileName, data);
    } else {
      alert('Alert', 'Unable to save excel file');
    }
  } catch (err) {
    alert('Error', `${err}`);
  }
};

const styles = StyleSheet.create({
  saveButton: {
    marginVertical: 5,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#ADD8E6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marginH5: {
    marginHorizontal: 5,
  },
  container: {
    flex: 1,
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
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
    color: '#000',
  },
  dataWrapper: {marginTop: -1},
  row: {height: 40, backgroundColor: '#c4e3ed'},
});
export default GradesPage;
