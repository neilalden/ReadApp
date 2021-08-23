import React, {useCallback, useContext, useState} from 'react';
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
  return (
    <>
      <Text style={styles.header}>list of student works</Text>
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
                <Text>{item.submittedBy}</Text>
                <Text style={styles.itemSubtitle}>
                  {(item.files || item.work) &&
                  (item.files.length !== 0 || item.work !== '')
                    ? 'Complied'
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
