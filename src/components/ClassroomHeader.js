import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Link} from 'react-router-native';
import IconGoBack from '../../assets/goback.svg';
import IconPeople from '../../assets/people-fill.svg';
import IconFile from '../../assets/file-earmark-text.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const ClassroomHeader = ({classCode = 'undefined', backTo, isStudent}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText}>{classCode}</Text>
        <Link to={backTo} style={styles.back} underlayColor="#ADD8E6">
          <IconGoBack height={25} width={40} color={Colors.black} />
        </Link>
      </View>
      {isStudent ? (
        <View style={styles.subtitleContainer2}>
          <IconFile height={25} width={25} color={Colors.black} />
          <Text style={styles.subtitleText}>Classroom</Text>
        </View>
      ) : (
        <View style={styles.subtitleContainer}>
          <Link to="/Classroom" underlayColor="#C1E1EC">
            <View style={styles.subtitle}>
              <IconFile height={25} width={25} color={Colors.black} />
              <Text style={styles.subtitleText}>Classwork</Text>
            </View>
          </Link>
          <Link to="/People" underlayColor="#C1E1EC">
            <View style={styles.subtitle}>
              <IconPeople height={25} width={25} color={Colors.black} />
              <Text style={styles.subtitleText}>People</Text>
            </View>
          </Link>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  back: {
    padding: 5,
  },
  header: {
    margin: 15,
    backgroundColor: '#ADD8E6',
    borderRadius: 15,
    padding: 15,
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Lato-Regular',
  },
  headerTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
  },
  subtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subtitleContainer2: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  subtitle: {
    marginTop: 5,
    flexDirection: 'row',
    color: 'black',
    padding: 5,
    fontSize: 15,
    fontFamily: 'Lato-Regular',
  },
  subtitleText: {
    paddingLeft: 8,
  },
});
export default ClassroomHeader;
