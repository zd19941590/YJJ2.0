import React, { PureComponent } from 'react';
import BaseComponent from '../../components/BaseComponent.js';
import ReactNative, {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
export class LongImgDetail extends BaseComponent {
    static propTypes = {
      imgList: PropTypes.array,
     
    }
    constructor(prop) {
      super(prop);
      this.state = {
        imgList: [],
      }
    }
    componentDidMount(){

    }
    render(){
        return (
        <View  style={contentStyles.bgimg}>
             <ScrollView  style={contentStyles.bgimg} >
            </ScrollView>
        </View>
        )
    }
}
function setStyle() {
    if (contentStyles != null && !CompanyConfig.isGeneral()) return contentStyles;
    contentStyles = StyleSheet.create({
        bgimg: {
          flex: 1
        }
    })
}
