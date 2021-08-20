import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Link} from 'react-router-native';

const Nav = ({isLoading}) => {
  return (
    <View style={styles.header}>
      <Link to="/" underlayColor="#f0f4f7" disabled={isLoading}>
        <Text style={styles.headerText}>Library</Text>
      </Link>
      <Link to="/ClassList" underlayColor="#f0f4f7" disabled={isLoading}>
        <Text style={styles.headerText}>Classes</Text>
      </Link>
      <Link to="/Account" underlayColor="#f0f4f7" disabled={isLoading}>
        <Text style={styles.headerText}>Account</Text>
      </Link>
    </View>
  );
};
const styles = StyleSheet.create({
  body: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#ccc',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginVertical: 10,
    marginHorizontal: 10,
  },
});

export default Nav;
