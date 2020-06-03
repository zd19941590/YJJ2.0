'use strict';
import PropTypes from "prop-types";

import React, { Component } from 'react';
import { Image,Dimensions } from 'react-native';
import EnvConfig from '../../config/app.config.js';

import ViewTransformer from 'react-native-view-transformer';
let DEV = false;
var deviceSize = Dimensions.get('window');
let readerTimes = 0;
export default class TransformableImage extends Component {

  static enableDebug() {
    DEV = true;
  }

  static propTypes = {
    pixels: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    }),

    enableTransform: PropTypes.bool,
    enableScale: PropTypes.bool,
    enableTranslate: PropTypes.bool,
    onTransformGestureReleased: PropTypes.func,
    onViewTransformed: PropTypes.func,
    isNewImages: PropTypes.bool,
  };

  static defaultProps = {
    enableTransform: true,
    enableScale: true,
    enableTranslate: true
  };

  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,

      imageLoaded: false,
      pixels: undefined,
      keyAcumulator: 1,
      readerAgen: false,
      isError: false,
    };
  }

  UNSAFE_componentWillMount() {
    if (!this.props.pixels) {
      this.getImageSize(this.props.source);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!sameSource(this.props.source, nextProps.source)) {
      //image source changed, clear last image's pixels info if any
      this.setState({ pixels: undefined, keyAcumulator: this.state.keyAcumulator + 1 })
      this.getImageSize(nextProps.source);
    }
  }

  render() {
    let maxScale = 1;
    let contentAspectRatio = undefined;
    let width, height; //pixels

    if (this.props.pixels) {
      //if provided via props
      width = this.props.pixels.width;
      height = this.props.pixels.height;
    } else if (this.state.pixels) {
      //if got using Image.getSize()
      width = this.state.pixels.width;
      height = this.state.pixels.height;
    }
    let resizeModeStr = 'contain';
    if (width && height) {
      let dscale = deviceSize.width / deviceSize.height
      let scale = 1;
      if (height > 0) {
        scale = width / height
        let resultscale = scale / dscale
        if (resultscale >= 0.9 && resultscale <= 1.1) {
          resizeModeStr = 'cover';
        }
      }
      contentAspectRatio = width / height;
      if (this.state.width && this.state.height) {
        maxScale = Math.max(width / this.state.width, height / this.state.height);
        maxScale = Math.max(1, maxScale);
      }
    }

    return (
      <ViewTransformer
        ref='viewTransformer'
        key={'viewTransformer#' + this.state.keyAccumulator} //when image source changes, we should use a different node to avoid reusing previous transform state
        enableTransform={this.props.enableTransform && this.state.imageLoaded} //disable transform until image is loaded
        enableScale={this.props.enableScale}
        enableTranslate={this.props.enableTranslate}
        enableResistance={true}
        onTransformGestureReleased={this.props.onTransformGestureReleased}
        onViewTransformed={this.props.onViewTransformed}
        maxScale={maxScale}
        contentAspectRatio={contentAspectRatio}
        onLayout={this.onLayout.bind(this)}
        style={this.props.style}>
        <Image
          onError={(error) => {
            this.setState({
              isError: true
            })
          }}
          source={{ uri: this.getSrc() }}
          // {...this.props}
          style={[this.props.style, { backgroundColor: 'transparent' }]}
          resizeMode={resizeModeStr}
          onLoadStart={this.onLoadStart.bind(this)}
          onLoad={this.onLoad.bind(this)}
          capInsets={{ left: 0.1, top: 0.1, right: 0.1, bottom: 0.1 }} //on iOS, use capInsets to avoid image downsampling
        />
      </ViewTransformer>
    );
  }
  getSrc() {
    if (this.state.isError) {
      return EnvConfig.imageBaseUrl + this.props.images[this.props.pageId].Path;
      this.state.isError = false;
    } else {
      this.state.isError = false;
      return this.props.images[this.props.pageId].uri;
    }
  }
  onLoadStart(e) {
    this.props.onLoadStart && this.props.onLoadStart(e);
    this.setState({
      imageLoaded: false
    });
  }

  onLoad(e) {
    this.props.onLoad && this.props.onLoad(e);
    this.setState({
      imageLoaded: true
    });
  }

  onLayout(e) {
    let { width, height } = e.nativeEvent.layout;
    if (this.state.width !== width || this.state.height !== height) {
      this.setState({
        width: width,
        height: height
      });
    }
  }
  getImageSize(source) {
    if (!source) return;

    DEV && console.log('getImageSize...' + JSON.stringify(source));

    try {
      if (typeof Image.getSize === 'function') {

        if (source && source.uri) {
          Image.getSize(
            source.uri,
            (width, height) => {
              DEV && console.log('getImageSize...width=' + width + ', height=' + height);
              if (width && height) {
                if (this.state.pixels && this.state.pixels.width === width && this.state.pixels.height === height) {
                  //no need to update state
                } else {
                  this.setState({ pixels: { width, height } });
                }
              }
            },
          )
        } else {
          console.warn('getImageSize...please provide pixels prop for local images');
        }
      } else {
        console.warn('getImageSize...Image.getSize function not available before react-native v0.28');
      }
    } catch (error) {

    }


  }

  getViewTransformerInstance() {
    return this.refs['viewTransformer'];
  }
}

function sameSource(source, nextSource) {
  if (source === nextSource) {
    return true;
  }
  if (source && nextSource) {
    if (source.uri && nextSource.uri) {
      return source.uri === nextSource.uri;
    }
  }
  return false;
}