import React, {useContext, useEffect} from 'react';
import {View, Text, StyleSheet, Image, ScrollView} from 'react-native';
import {ClassContext, fetchClassList} from '../../context/ClassContext';

import {Link} from 'react-router-native';

import {AuthContext} from '../../context/AuthContext';

const StudentClassList = ({userInfo}) => {
  const {classList, setClassList, setClassNumber} = useContext(ClassContext);
  const {user} = useContext(AuthContext);
  return (
    <ScrollView>
      {classList &&
        classList.map((item, index) => {
          return (
            <Link
              to="/Classroom"
              underlayColor="#C1E1EC"
              key={index}
              style={styles.item}
              onPress={() => {
                setClassNumber(index);
              }}>
              <>
                <View style={styles.classInfo}>
                  <Text style={styles.header}>{item.subject}</Text>
                  {item.teachers[0].name && (
                    <View style={styles.flexDirectionRow}>
                      <Image
                        style={styles.itemPic}
                        source={{
                          uri: item.teachers[0].photoUrl,
                        }}
                      />
                      <Text style={styles.textAlignCenter}>
                        {item.teachers[0].name.length > 20
                          ? `${item.teachers[0].name.substring(0, 20)}...`
                          : item.teachers[0].name}
                      </Text>
                    </View>
                  )}
                </View>

                <Image
                  style={styles.imageHeader}
                  source={{uri: `asset:/image_headers/${item.classHeader}.png`}}
                />
              </>
            </Link>
          );
        })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  imageHeader: {
    resizeMode: 'center',
    height: 120,
    width: 120,
  },
  classInfo: {
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  flexDirectionRow: {
    flexDirection: 'row',
  },
  textAlignCenter: {
    alignSelf: 'center',
    fontFamily: 'Lato-Regular',
  },
  item: {
    backgroundColor: '#ADD8E6',
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 5,
    height: 120,
  },
  header: {
    fontFamily: 'Lato-Regular',
    fontSize: 20,
    textAlign: 'left',
  },
  itemSubtitle: {
    fontFamily: 'Lato-Regular',
    marginTop: 5,
    marginRight: 5,
    color: '#000',
    fontSize: 12,
    textAlign: 'left',
  },
  teachersNameContainer: {
    flexDirection: 'row',
  },
  itemPic: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderRadius: 50,
    height: 25,
    width: 25,
    marginRight: 5,
    alignSelf: 'center',
  },
});

export default StudentClassList;
