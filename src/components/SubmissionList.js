import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  BackHandler,
} from 'react-native';
import {ClassContext, fetchSubmissionList} from '../context/ClassContext';

const SubmissionList = () => {
  const [refreshing, setRefreshing] = useState(false);
  const {classNumber, classworkNumber, classList, setClassList} =
    useContext(ClassContext);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSubmissionList(classNumber, classworkNumber, classList, setClassList);
    wait(1000).then(() => setRefreshing(false));
  }, []);
  useEffect(() => {
    if (!classList[classNumber].classworkList[classworkNumber].submissionList) {
      fetchSubmissionList(
        classNumber,
        classworkNumber,
        classList,
        setClassList,
      );
    }

    BackHandler.addEventListener('hardwareBackPress', () => true);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);
  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>
          {classList[classNumber].classworkList[classworkNumber].title}
        </Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {classList[classNumber].classworkList[classworkNumber].submissionList &&
          classList[classNumber].classworkList[
            classworkNumber
          ].submissionList.map((item, index) => {
            return (
              <View key={index} style={styles.item}>
                <Text>{item.submittedBy.name}</Text>
                <Text style={styles.itemSubtitle}>
                  {item.work || item.files
                    ? item.work != '' || item.files.length != 0
                      ? 'Complied'
                      : 'Missing'
                    : 'Missing'}
                </Text>
              </View>
            );
          })}
      </ScrollView>
    </>
  );
};

const wait = timeout => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};
const styles = StyleSheet.create({
  item: {
    justifyContent: 'space-between',
    backgroundColor: '#ADD8E6',
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
    padding: 15,
    textAlign: 'center',
    color: '#ededed',
  },
  headerContainer: {
    backgroundColor: '#3d3d3d',
    width: 'auto',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
});
export default SubmissionList;
