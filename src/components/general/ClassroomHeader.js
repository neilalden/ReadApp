import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Link} from 'react-router-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import IconGoBack from '../../../assets/goback.svg';

const ClassroomHeader = ({subject = 'undefined', section = 'undefined'}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTextContainer}>
        <View>
          <Text style={styles.headerText}>{subject}</Text>
          <Text style={styles.subtitle}>{section}</Text>
        </View>
        <Link to="/ClassList" style={styles.back} underlayColor="#C1E1EC">
          <IconGoBack height={30} width={30} color={Colors.black} />
        </Link>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  back: {
    padding: 5,
    borderRadius: 50,
    alignSelf: 'center',
  },
  header: {
    backgroundColor: '#ADD8E6',
    borderRadius: 15,
    padding: 10,
    margin: 5,
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Lato-Regular',
  },
  headerTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    paddingBottom: 0,
  },

  subtitle: {
    fontFamily: 'Lato-Regular',
    fontSize: 12,
  },
});
export default ClassroomHeader;
