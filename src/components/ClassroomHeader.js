import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Link} from 'react-router-native';

const ClassroomHeader = ({classCode = 'undefined', backTo, isStudent}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText}>{classCode}</Text>
        <Link to={backTo} style={styles.back} underlayColor="#f0f4f7">
          <Text>back</Text>
        </Link>
      </View>
      {isStudent ? (
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>classroom</Text>
        </View>
      ) : (
        <View style={styles.subtitleContainer}>
          <Link to="/Classroom" underlayColor="#f0f4f7">
            <Text style={styles.subtitle}>classroom</Text>
          </Link>
          <Link to="/People" underlayColor="#f0f4f7">
            <Text style={styles.subtitle}>people</Text>
          </Link>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  back: {
    marginTop: 15,
    borderRadius: 5,
    padding: 5,
  },
  header: {
    width: '100%',
    backgroundColor: '#ccc',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 10,
  },
  headerTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 30,
  },
  subtitleContainer: {flexDirection: 'row', marginLeft: 20},
  subtitle: {
    fontFamily: 'monospace',
    color: '#666666',
    marginVertical: 5,
    marginHorizontal: 10,
  },
});
export default ClassroomHeader;
