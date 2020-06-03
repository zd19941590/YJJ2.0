import PropTypes from 'prop-types';
import React, { PureComponent, Children } from 'react';
import { View, ScrollView, Animated, Platform, ViewPropTypes,StyleSheet } from 'react-native';

// import Indicator from '../indicator';
// import styles from './styles';

const floatEpsilon = Math.pow(2, -23);

function equal(a, b) {
  return Math.abs(a - b) <= floatEpsilon * Math.max(Math.abs(a), Math.abs(b));
}
const styles = StyleSheet.create({
  rtl: {
    transform: [{
      rotate: '180deg',
    }],
  },

  container: {
    flex: 1,
  },
  dot: {
    backgroundColor: 'white',
    borderRadius: 4,
    width: 8,
    height: 8,
    margin: 4,
  },
  incontainer:{    
    flex: 1,
    justifyContent: 'center',
    margin: 4,},
  bottom: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
  },

  top: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
  },

  left: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },

  right: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
  },
})
export default class Pages extends PureComponent {
  static defaultProps = {
    pagingEnabled: true,
    showsHorizontalScrollIndicator: false,
    showsVerticalScrollIndicator: false,
    scrollEventThrottle: 30,
    scrollsToTop: false,
    indicatorColor: '#3891fb',
    indicatorOpacity: 0.30,
    startPage: 0,
    horizontal: true,
    rtl: false,
  };

  static propTypes = {
    style: ViewPropTypes.style,
    containerStyle: ViewPropTypes.style,

    indicatorColor: PropTypes.string,
    indicatorOpacity: PropTypes.number,
    indicatorPosition: PropTypes.oneOf([
      'none',
      'top',
      'right',
      'bottom',
      'left',
    ]),

    startPage: PropTypes.number,
    progress: PropTypes.instanceOf(Animated.Value),

    horizontal: PropTypes.bool,
    rtl: PropTypes.bool,

    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),

    onLayout: PropTypes.func,
    onScrollEnd: PropTypes.func,
    renderPager: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.onLayout = this.onLayout.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onScrollBeginDrag = this.onScrollBeginDrag.bind(this);
    this.onScrollEndDrag = this.onScrollEndDrag.bind(this);

    this.updateRef = this.updateRef.bind(this, 'scroll');
    this.renderPage = this.renderPage.bind(this);

    let { startPage, progress = new Animated.Value(startPage) } = this.props;

    this.progress = startPage;
    this.mounted = false;
    this.scrollState = -1;

    this.state = {
      layout: false,
      width: 0,
      height: 0,
      progress,
    };
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentDidUpdate() {
    if (-1 === this.scrollState) {
      /* Fix scroll position after layout update */
      requestAnimationFrame(() => {
        this.scrollToPage(Math.floor(this.progress), false);
      });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(props) {
    let { progress } = props;

    if (progress !== this.props.progress) {
      progress.setValue(this.progress);

      this.setState({ progress });
    }
  }

  updateRef(name, ref) {
    this[name] = ref;
  }

  onLayout(event) {
    let { width, height } = event.nativeEvent.layout;
    let { onLayout } = this.props;

    if ('function' === typeof onLayout) {
      onLayout(event);
    }

    this.setState({ width, height, layout: true });
  }

  onScroll(event) {
    if (-1 === this.scrollState) {
      return;
    }

    let { horizontal } = this.props;
    let { [horizontal? 'x' : 'y']: offset } = event.nativeEvent.contentOffset;

    let { [horizontal? 'width' : 'height']: base, progress } = this.state;

    let radices = 1;
    if(event.nativeEvent&&event.nativeEvent.velocity){
      if(event.nativeEvent.velocity.y>=0){//向上滑动
        let remainder = base?offset % base:0;
        if(remainder>100){
          radices = Math.ceil( offset / base)
        }else if(remainder>0){
          radices =Math.round( offset / base );
        }else{
          radices =  offset / base
        }
      }else{//向下滑动
        let remainder = base?offset % base:0;
        if(remainder>100){
          radices = Math.floor( offset / base)
        }else if(remainder>0){
          radices =Math.round( offset / base );
        }
        else{
          radices =  offset / base
        }
      }
      // radices = event.nativeEvent.velocity.y>0 ?1.1:0.9;
    }
    progress.setValue(this.progress = radices);

    let discreteProgress = Math.round(this.progress);

    if (1 === this.scrollState && equal(discreteProgress, this.progress)) {
      this.onScrollEnd();

      this.scrollState = -1;
    }
  }

  onScrollBeginDrag() {
    this.scrollState = 0;
  }

  onScrollEndDrag() {
    let { horizontal } = this.props;

    /* Vertical pagination is not working on android, scroll by hands */
    if ('android' === Platform.OS && !horizontal) {
      this.scrollToPage(Math.round(this.progress));
    }

    this.scrollState = 1;
  }

  onScrollEnd() {
    let { onScrollEnd } = this.props;

    if ('function' === typeof onScrollEnd) {
      onScrollEnd(Math.round(this.progress));
    }
  }

  scrollToPage(page, animated = true) {
    let { horizontal } = this.props;
    let { [horizontal? 'width' : 'height']: base } = this.state;

    if (animated) {
      this.scrollState = 1;
    }

    if (this.mounted && this.scroll) {
      this.scroll.scrollTo({
        [horizontal? 'x' : 'y']: page * base,
        animated,
      });
    }
  }

  isDragging() {
    return 0 === this.scrollState;
  }

  isDecelerating() {
    return 1 === this.scrollState;
  }

  renderPage(page, index) {
    let { width, height, progress } = this.state;
    let { children, horizontal, rtl } = this.props;

    let pages = Children.count(children);

    let pageStyle = (horizontal && rtl)?
      styles.rtl:
      null;

    /* Adjust progress by page index */
    progress = Animated.add(progress, -index);

    return (
      <View style={[{ width, height }, pageStyle]}>
        {React.cloneElement(page, { index, pages, progress })}
      </View>
    );
  }

  renderPager(pager) {
    let { renderPager, horizontal, rtl } = this.props;

    if ('function' === typeof renderPager) {
      return renderPager({ horizontal, rtl, ...pager });
    }

    let { indicatorPosition } = pager;

    if ('none' === indicatorPosition) {
      return null;
    }

    let indicatorStyle = (horizontal && rtl)?
      styles.rtl:
      null;

    return (
      <View style={[styles[indicatorPosition], indicatorStyle]}>
        <Indicator {...pager} />
      </View>
    );
  }

  renderPages(props) {
    let { horizontal, rtl, style, children } = this.props;
    let { [horizontal? 'width' : 'height']: base, layout } = this.state;

    if (!layout) {
      return null;
    }

    let scrollStyle = (horizontal && rtl)?
      styles.rtl:
      null;

    let contentOffset = {
      [horizontal? 'x' : 'y']: base * Math.floor(this.progress),
      [horizontal? 'y' : 'x']: 0,
    };

    return (
      <ScrollView
        {...props}
        onMoveShouldSetResponderCapture ={(event)=>{ return false;}}
        style={[styles.container, style, scrollStyle]}
        onScroll={this.onScroll}
        overScrollMode ='always'
        onScrollBeginDrag={this.onScrollBeginDrag}
        onScrollEndDrag={this.onScrollEndDrag}
        contentOffset={contentOffset}
        ref={this.updateRef}
        initialListSize={3}
        bounces  = {true}
        removeClippedSubviews ={true}
      >
        {Children.map(children, this.renderPage)}
      </ScrollView>
    );
  }

  render() {
    let { progress } = this.state;
    let { horizontal } = this.props;
    let {
      style,
      containerStyle,
      children,
      indicatorColor,
      indicatorOpacity,
      indicatorPosition = horizontal? 'bottom' : 'right',
      ...props
    } = this.props;

    let pages = Children.count(children);

    let Pager = () =>
      this.renderPager({
        pages,
        progress,
        indicatorColor,
        indicatorOpacity,
        indicatorPosition,
      });

    return (
      <View style={[styles.container, containerStyle]} onLayout={this.onLayout}>
        {this.renderPages(props)}

        <Pager />
      </View>
    );
  }
}
export  class Indicator extends PureComponent {
  static propTypes = {
    style: ViewPropTypes.style,

    pages: PropTypes.number.isRequired,
    progress: PropTypes.instanceOf(Animated.Value).isRequired,
    indicatorColor: PropTypes.string.isRequired,
    indicatorOpacity: PropTypes.number.isRequired,
    indicatorPosition: PropTypes.oneOf([
      'top',
      'right',
      'bottom',
      'left',
    ]).isRequired,
  };

  render() {
    let {
      pages,
      progress,
      indicatorColor: backgroundColor,
      indicatorOpacity,
      indicatorPosition,
      style,
      ...props
    } = this.props;

    let dots = Array.from(new Array(pages), (page, index) => {
      let opacity = progress
        .interpolate({
          inputRange: [
            -Infinity,
            index - 1,
            index,
            index + 1,
            Infinity,
          ],
          outputRange: [
            indicatorOpacity,
            indicatorOpacity,
            1.0,
            indicatorOpacity,
            indicatorOpacity,
          ],
        });

      let style = { opacity, backgroundColor };

      return (
        <Animated.View style={[styles.dot, style]} key={index} />
      );
    });

    let flexDirection = /^(top|bottom)$/
      .test(indicatorPosition)?
        'row':
        'column';

    return (
      <View style={[styles.incontainer, { flexDirection }, style]} {...props}>
        {dots}
      </View>
    );
  }
}
