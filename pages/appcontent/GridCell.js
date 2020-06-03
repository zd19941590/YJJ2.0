import React from 'react';
import {
  StyleSheet,
  Image,
  TouchableHighlight,
} from "react-native";
import AppConfig from '../../config/app.config';
import FileHelper from '../../helpers/fileHelper.config';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme.js';

export default class GridCell extends React.Component {
  constructor() {
    super();
    this.state = {
      imageUrl: "",
      imgLoaded: false,
    }
  }

  render() {
    if(!this.state.imageUrl){
      return null
    }
    let newimgStyle = [];
    if(this.state.imgLoaded){
      newimgStyle = { width: getResponsiveValue(410), height: getResponsiveValue(313) };
    }
    return (
      <TouchableHighlight onPress={this.props.onClick}>
        <Image style={[styles.container, this.props.style,newimgStyle]} source={{ uri: this.state.imageUrl }} />
      </TouchableHighlight>
    )
  }

  componentDidMount() {
    let thisObj = this;
    FileHelper.fetchFile(thisObj.props.path, 450).then(path => {
      if (path) {
        thisObj.setState({
          imageUrl: path,
          imgLoaded:true
        })
      } 
      // else {
      //   this.setState({
      //     imageUrl: AppConfig.defaultFailImage,imgLoaded:true
      //   })
      // }
    }).catch(function (error) {
      thisObj.setState({ imageUrl: AppConfig.defaultFailImage, imgLoaded: true });
  });
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center"
  },


})