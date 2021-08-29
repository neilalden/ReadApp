import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Link} from 'react-router-native';
import IconLib from '../../assets/books.svg';
import IconClass from '../../assets/door-open.svg';
import IconAccount from '../../assets/account.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const Nav = () => {
  return (
    <View style={styles.header}>
      <Link to="/" underlayColor="#f0f4f7">
        <View style={styles.iconView}>
          <IconLib height={20} width={40} color={Colors.black} />
          <Text style={styles.navText}>Library</Text>
        </View>
      </Link>
      <Link to="/ClassList" underlayColor="#f0f4f7">
        <View style={styles.iconView}>
          <IconClass height={20} width={40} color={Colors.black} />
          <Text style={styles.navText}>Classes</Text>
        </View>
      </Link>
      <Link to="/Account" underlayColor="#f0f4f7">
        <View style={styles.iconView}>
          <IconAccount height={20} width={40} color={Colors.black} />
          <Text style={styles.navText}>Account</Text>
        </View>
      </Link>
    </View>
  );
};
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    minWidth: 90,
  },
});

export default Nav;
