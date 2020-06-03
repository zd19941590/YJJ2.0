import React from 'react';
import {
  StyleSheet,
  ImageBackground,
  FlatList,
  TouchableHighlight,
} from "react-native";
import Icon from '../../components/svguri';
import { getResponsiveValue } from '../../assets/default.theme';
import CompanyConfig from '../../config/company.config';
import Service from '../../services/appcontent';
import GridCell from "./GridCell";

export default class GridBrowser extends React.Component {
  constructor() {
    super();
    this.state = {
      syncDataSource: []
    }
  }

  render() {
    const { navigate, state } = this.props.navigation;
    return (
      <ImageBackground style={styles.container} source={CompanyConfig.CompanyBGImg}>
        <FlatList style={styles.table}
          key={'shows'}
          numColumns={3}
          data={this.state.syncDataSource}
          columnWrapperStyle={{ justifyContent: 'flex-start' }}
          keyExtractor={(item, index) => index}
          renderItem={({ item, index }) => {
            const dynamicStyle = [
              index % 3 === 0 ? { marginLeft: 0 } : { marginLeft: getResponsiveValue(24) },
              index / 3 < 1 ? { marginTop: 0 } : { marginTop: getResponsiveValue(24) }
            ]
            return (
              <GridCell style={[styles.cell, dynamicStyle]} path={item} onClick={() => {
                navigate('ContentDetail', { sysno: state.params.sysno, defaultIndex: index });
              }} />
            )
          }}
        />
        <TouchableHighlight
          style={[styles.back, { backgroundColor: CompanyConfig.AppColor.OnPressMain }]}
          underlayColor={CompanyConfig.AppColor.OnPressSecondary}
          onPress={() => this.props.navigation.goBack()}
        >
          <Icon width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={'#3a90e7'} source={'back'} />
        </TouchableHighlight>
      </ImageBackground>
    )
  }

  componentDidMount() {
    const { state } = this.props.navigation;
    const sysno = state.params.sysno;
    (new Service()).GetContentDetail(sysno,
      (result) => {
        if (result && result.FileList) {
          result.FileList.forEach((item) => {
            this.state.syncDataSource.push(item.Path)
          })
          this.forceUpdate();
        }
      });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  back: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: getResponsiveValue(80),
    height: getResponsiveValue(80),
    left: getResponsiveValue(20),
    top: getResponsiveValue(20),
    borderRadius: getResponsiveValue(40),
  },
  table: {
    margin: getResponsiveValue(20),
    flex: 1,
  },
  cell: {
    marginLeft: getResponsiveValue(30),
    width: getResponsiveValue(416),
    height: getResponsiveValue(300),
  },

})