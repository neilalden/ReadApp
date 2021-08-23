import React, {useCallback, useContext, useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {ClassContext, fetchSubmissionList} from '../context/ClassContext';

const wait = timeout => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};
const SubmissionList = () => {
  const {classNumber, classList, classworkNumber, setClassList} =
    useContext(ClassContext);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSubmissionList(classNumber, classworkNumber, classList, setClassList);
    wait(1000).then(() => setRefreshing(false));
  }, []);
  useEffect(() => {
    if (!classList[classNumber].classworkList[classworkNumber].submission) {
      fetchSubmissionList(
        classNumber,
        classworkNumber,
        classList,
        setClassList,
      );
    }
  }, []);
  return (
    <>
      <Text style={styles.header}>
        {classList[classNumber].classworkList[classworkNumber].title}
      </Text>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {classList[classNumber].classworkList[classworkNumber].submissionList &&
          classList[classNumber].classworkList[
            classworkNumber
          ].submissionList.map((item, index) => {
            console.log(item.work);
            console.log(item.files);
            // let didComply = false;
            // if (item.files === undefined || item.work === undefined) {
            //   didComply = false;
            //   console.log('44');
            // } else if (item.files.length === 0 || item.work === '') {
            //   didComply = false;
            //   console.log('47');
            // } else {
            //   didComply = true;
            // }
            return (
              <View key={index} style={styles.item}>
                <Text>{item.submittedBy}</Text>
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
});
export default SubmissionList;
