import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Link} from 'react-router-native';
import IconPeople from '../../../assets/people.svg';
import IconFile from '../../../assets/file-earmark-text.svg';
import IconTable from '../../../assets/table.svg';
import IconFeed from '../../../assets/card-heading.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';
const ClassroomNav = ({isStudent}) => {
  return (
    <View style={styles.container}>
      {isStudent ? (
        <View style={styles.navContainer}>
          <Link
            to="/Classroom"
            style={{width: '33.3%'}}
            underlayColor="#f0f4f7">
            <View style={styles.navItem}>
              <IconFile height={20} width={20} color={Colors.black} />
              <Text style={styles.subtitleText}>Classwork</Text>
            </View>
          </Link>
          <Link to="/Feed" style={{width: '33.3%'}} underlayColor="#f0f4f7">
            <View style={styles.navItem}>
              <IconFeed height={20} width={20} color={Colors.black} />
              <Text style={styles.subtitleText}>Feed</Text>
            </View>
          </Link>
          <Link to="/People" style={{width: '33.3%'}} underlayColor="#f0f4f7">
            <View style={styles.navItem}>
              <IconPeople height={20} width={20} color={Colors.black} />
              <Text style={styles.subtitleText}>People</Text>
            </View>
          </Link>
        </View>
      ) : (
        <View style={styles.navContainer}>
          <Link to="/Classroom" style={{width: '25%'}} underlayColor="#f0f4f7">
            <View style={styles.navItem}>
              <IconFile height={20} width={20} color={Colors.black} />
              <Text style={styles.subtitleText}>Classwork</Text>
            </View>
          </Link>
          <Link to="/Feed" style={{width: '25%'}} underlayColor="#f0f4f7">
            <View style={styles.navItem}>
              <IconFeed height={20} width={20} color={Colors.black} />
              <Text style={styles.subtitleText}>Feed</Text>
            </View>
          </Link>
          <Link to="/People" style={{width: '25%'}} underlayColor="#f0f4f7">
            <View style={styles.navItem}>
              <IconPeople height={20} width={20} color={Colors.black} />
              <Text style={styles.subtitleText}>People</Text>
            </View>
          </Link>
          <Link to="/Grades" style={{width: '25%'}} underlayColor="#f0f4f7">
            <View style={styles.navItem}>
              <IconTable height={20} width={20} color={Colors.black} />
              <Text style={styles.subtitleText}>Grades</Text>
            </View>
          </Link>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  navText: {
    fontFamily: 'Lato-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  iconView: {
    alignItems: 'center',
    paddingVertical: 15,
    minWidth: '50%',
  },

  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  subtitleText: {
    fontSize: 12,
    fontFamily: 'Lato-Regular',
  },
});

export default ClassroomNav;
