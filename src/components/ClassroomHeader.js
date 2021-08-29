import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Link} from 'react-router-native';
import IconGoBack from '../../assets/goback.svg';
import IconPeople from '../../assets/people.svg';
import IconFile from '../../assets/file-earmark-text.svg';
import IconTable from '../../assets/table.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const ClassroomHeader = ({subject = 'undefined', isStudent}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText}>{subject}</Text>
        <Link to="/ClassList" style={styles.back} underlayColor="#C1E1EC">
          <IconGoBack height={20} width={40} color={Colors.black} />
        </Link>
      </View>
      {isStudent ? (
        <View style={styles.subtitleContainer}>
          <Link to="/Classroom" underlayColor="#C1E1EC">
            <View style={styles.subtitle}>
              <IconFile height={20} width={20} color={Colors.black} />
              <Text style={styles.subtitleText}>Classwork</Text>
            </View>
          </Link>
          <Link to="/People" underlayColor="#C1E1EC">
            <View style={styles.subtitle}>
              <IconPeople height={20} width={20} color={Colors.black} />
              <Text style={styles.subtitleText}>People</Text>
            </View>
          </Link>
        </View>
      ) : (
        <View style={styles.subtitleContainer}>
          <Link to="/Classroom" underlayColor="#C1E1EC">
            <View style={styles.subtitle}>
              <IconFile height={20} width={20} color={Colors.black} />
              <Text style={styles.subtitleText}>Classwork</Text>
            </View>
          </Link>
          <Link to="/Grades" underlayColor="#C1E1EC">
            <View style={styles.subtitle}>
              <IconTable height={20} width={20} color={Colors.black} />
              <Text style={styles.subtitleText}>Grades</Text>
            </View>
          </Link>
          <Link to="/People" underlayColor="#C1E1EC">
            <View style={styles.subtitle}>
              <IconPeople height={20} width={20} color={Colors.black} />
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
    marginBottom: 0,
  },
  header: {
    backgroundColor: '#ADD8E6',
    borderRadius: 15,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Lato-Regular',
    marginBottom: 0,
  },
  headerTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    paddingBottom: 0,
  },
  subtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 0,
  },
  subtitle: {
    color: 'black',
    fontFamily: 'Lato-Regular',
    alignItems: 'center',
    fontSize: 15,
    minWidth: 80,
    padding: 5,
    margin: 0,
  },
  subtitleText: {
    fontSize: 12,
  },
});
export default ClassroomHeader;
