import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  BackHandler,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useHistory} from 'react-router';
import {ClassContext, fetchSubmissionList} from '../../context/ClassContext';
import ActivitySubmission from '../general/ActivitySubmission';
import QuizSubmission from '../general/QuizSubmission';
import IconDelete from '../../../assets/trash.svg';

const SubmissionList = ({userInfo}) => {
  /***STATES***/
  const {
    classNumber,
    classworkNumber,
    classList,
    setClassList,
    setSubmissionListNumber,
  } = useContext(ClassContext);
  const history = useHistory();
  const [student, setStudent] = useState({});
  const [refresh, setRefresh] = useState(false);
  const classwork = classList[classNumber].classworkList[classworkNumber];

  /***HOOKS***/
  useEffect(() => {
    if (
      !classList[classNumber].classworkList[classworkNumber].submissionList ||
      refresh
    ) {
      fetchSubmissionList(
        classNumber,
        classworkNumber,
        classList,
        setClassList,
      );
      if (refresh) setRefresh(false);
    }

    BackHandler.addEventListener('hardwareBackPress', () => {
      if (Object.keys(student).length !== 0) {
        setStudent({});
      } else {
        history.push('/Classroom');
      }
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [refresh, student]);
  const onRefresh = useCallback(() => {
    setRefresh(true);
    wait(1000).then(() => setRefresh(false));
  }, []);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };

  /***FUNCTIONS***/
  const handleDeleteTask = () => {
    if (userInfo.isStudent) {
      alert('Only teachers can delete classworks');
    } else {
      Alert.alert(
        `Delete ${classwork.title}?`,
        'Deleting a classwork is permanent',
        [
          {
            text: 'YES',
            onPress: () => {
              firestore()
                .collection(`classes`)
                .doc(
                  `${classList[classNumber].classId}/classworks/${classList[classNumber].classworkList[classworkNumber].id}`,
                )
                .delete()
                .then(() => {
                  history.push('/Classroom');
                })
                .catch(e => {
                  alert(e.message, e.code);
                });
            },
          },
          {text: 'NO', onPress: () => true},
        ],
      );
    }
  };

  return (
    <>
      {Object.keys(student).length !== 0 ? (
        // Show either activity or quiz submission when a student is clicked
        classwork.isActivity ? (
          <ActivitySubmission
            userInfo={userInfo}
            student={student}
            setStudent={setStudent}
            setRefresh={setRefresh}
          />
        ) : (
          <QuizSubmission
            userInfo={userInfo}
            student={student}
            setStudent={setStudent}
          />
        )
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refresh={refresh} onRefresh={onRefresh} />
          }>
          <View
            style={{
              backgroundColor: '#3d3d3d',
              marginHorizontal: 15,
              marginVertical: 10,
              borderRadius: 10,

              flexDirection: 'row',
            }}>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>{classwork.title}</Text>
            </View>

            <TouchableOpacity
              style={styles.deleteIconContainer}
              onPress={handleDeleteTask}>
              <IconDelete height={30} width={30} color={'red'} />
            </TouchableOpacity>
          </View>

          {classwork.submissionList &&
            classwork.submissionList.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.item}
                  onPress={() => {
                    setStudent(item.submittedBy);
                    setSubmissionListNumber(index);
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <Image
                      style={styles.itemPic}
                      source={{
                        uri: item.submittedBy.photoUrl,
                      }}
                    />
                    <View>
                      <Text>{item.submittedBy.name}</Text>
                      <Text style={styles.itemSubtitle}>
                        {(item.work && item.work != '') ||
                        (item.files && item.files.length != 0)
                          ? 'Submitted'
                          : 'No submission'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  item: {
    justifyContent: 'space-between',
    backgroundColor: '#ADD8E6',
    fontFamily: 'Lato-Regular',
    marginHorizontal: 10,
    marginVertical: 3,
    borderRadius: 10,
    padding: 15,
  },
  itemSubtitle: {
    fontFamily: 'Lato-Regular',
    marginRight: 5,
    color: '#000',
  },
  itemPic: {
    marginRight: 10,
    borderRadius: 50,
    height: 50,
    width: 50,
    alignSelf: 'center',
    backgroundColor: '#000',
  },
  header: {
    color: '#ededed',
    fontFamily: 'Lato-Regular',
    fontSize: 18,
    padding: 15,
  },
  headerContainer: {
    width: '80%',
    alignItems: 'center',
    marginLeft: '10%',
    marginRight: '-5%',
  },
  deleteIconContainer: {
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 50,
    padding: 5,
  },
});

const alert = (message, title) => {
  Alert.alert(title, message, [{text: 'OK', onPress: () => true}]);
};

export default SubmissionList;
