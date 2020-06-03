import React, {  Component } from 'react';
import PropTypes from "prop-types";

import {
  View,
  ListView,
  Platform
} from 'react-native';

import Scroller from 'react-native-scroller';
import { createResponder } from 'react-native-gesture-responder';
import TimerMixin from 'react-timer-mixin';
import reactMixin from 'react-mixin';

const MIN_FLING_VELOCITY = 0.5;

export default class ViewPager extends Component {

  static propTypes = {
    ...View.propTypes,
    initialPage: PropTypes.number,
    pageMargin: PropTypes.number,
    scrollEnabled: PropTypes.bool,
    renderPage: PropTypes.func,
    pageDataArray: PropTypes.array,
    // onMomentumScrollEnd:PropTypes.func,
    onPageSelected: PropTypes.func,
    onPageScrollStateChanged: PropTypes.func,
    onPageScroll: PropTypes.func,
    getPageIndex: PropTypes.func,
    iShorizontal: PropTypes.bool,
    // scrollToX:PropTypes.func,
  };

  static defaultProps = {
    initialPage: 0,
    pageMargin: 0,
    scrollEnabled: true,
    iShorizontal: true,
    pageDataArray: [],
  };

  pageCount = 0; //Initialize to avoid undefined error
  currentPage = undefined; //Do not initialize to make onPageSelected(0) be dispatched
  layoutChanged = false;
  initialPageSettled = false;
  activeGesture = false;
  gestureResponder = undefined;
  pageIndex = 0;
  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      width: 0,
      height: 0,
      dataSource: ds.cloneWithRows([])
    }

    this.scroller = new Scroller(true, (dx, dy, scroller) => {
      if (dy === 0 && dy === 0 && scroller.isFinished()) {
        if (!this.activeGesture) {
          this.onPageScrollStateChanged('idle');
        }
      } else {
        const curY = this.scroller.getCurrY();
        if (this.refs['innerListView']) {
          this.refs['innerListView'].scrollTo({ y: curY, animated: false });
        }
        let position = Math.floor(curY / (this.state.height + this.props.pageMargin));
        position = this.validPage(position);

        let offset = (curY - this.getScrollOffsetOfPage(position)) / (this.state.height + this.props.pageMargin);
        let fraction = (curY - this.getScrollOffsetOfPage(position) - this.props.pageMargin) / this.state.height;
        if (fraction < 0) {
          fraction = 0;
        }
        this.props.onPageScroll && this.props.onPageScroll({
          position, offset, fraction
        });
      }
    });
  }
  UNSAFE_componentWillMount() {
    this.gestureResponder = createResponder({
      onStartShouldSetResponder: (evt, gestureState) => true,
      onResponderGrant: this.onResponderGrant.bind(this),
      onResponderMove: this.onResponderMove.bind(this),
      onResponderRelease: this.onResponderRelease.bind(this),
      onResponderTerminate: this.onResponderRelease.bind(this)
    });
  }

  onResponderGrant(evt, gestureState) {
    this.scroller.forceFinished(true);
    this.activeGesture = true;
    this.onPageScrollStateChanged('dragging');
  }

  onResponderMove(evt, gestureState) {
    let dy = gestureState.moveY - gestureState.previousMoveY;
    this.scrollByOffset(dy);
  }

  onResponderRelease(evt, gestureState, disableSettle) {
    this.activeGesture = false;
    if (!disableSettle) {
      this.settlePage(gestureState.vy);
    }
  }
  render() {
    let dataSource = this.state.dataSource;
    if (this.state.width && this.state.height) {
      let list = this.props.pageDataArray;
      if (!list) {
        list = [];
      }
      dataSource = dataSource.cloneWithRows(list);
      this.pageCount = list.length;
    }
    let gestureResponder = this.gestureResponder;
    if (!this.props.scrollEnabled || this.pageCount <= 0) {
      gestureResponder = {};
    }
    return (
      <View
        {...this.props}
        style={[this.props.style, { flex: 1 }]}
        {...gestureResponder}>
        <ListView
          style={{ flex: 1 }}
          ref='innerListView'
          scrollEnabled={false}
          initialListSize={4}
          // removeClippedSubviews={true}//用于将屏幕以外的视图卸载
          // horizontal={this.props.iShorizontal}
          enableEmptySections={true}
          dataSource={dataSource}
          showsHorizontalScrollIndicator={false}
          renderRow={this.renderRow.bind(this)}
          onLayout={this.onLayout.bind(this)}
          horizontal={false}
        />
      </View>
    );
  }

  renderRow(rowData, sectionID, rowID, highlightRow) {
    const { width, height } = this.state;
    let page = this.props.renderPage(rowData, rowID, { width, height });

    let newProps = {
      ...page.props,
      ref: page.ref,
      style: [page.props.style, {
        width: width,
        height: height,
        position: 'relative',
      }]
    };
    const element = React.createElement(page.type, newProps);

    if (this.props.pageMargin > 0 && rowID > 0) {
      //Do not using margin style to implement pageMargin. The ListView seems to calculate a wrong width for children views with margin.
      return (
        <View style={{ width: width + this.props.pageMargin, height: height, alignItems: 'flex-end' }}>
          {element}
        </View>
      );
    } else {
      return element;
    }
  }

  onLayout(e) {
    let { width, height } = e.nativeEvent.layout;
    let sizeChanged = this.state.width !== width || this.state.height !== height;
    if (width && height && sizeChanged) {
      //if layout changed, create a new DataSource instance to trigger renderRow
      this.layoutChanged = true;
      this.setState({
        width, height,
        dataSource: (new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })).cloneWithRows([])
      });
    }
  }

  componentDidUpdate() {
    if (!this.initialPageSettled) {
      this.initialPageSettled = true;
      if (Platform.OS === 'ios') {
        this.scrollToPage(this.props.initialPage, true);
      } else {
        //A trick to solve bugs on Android. Delay a little
        setTimeout(this.scrollToPage.bind(this, this.props.initialPage, true), 0);
      }
    } else if (this.layoutChanged) {
      this.layoutChanged = false;
      if (typeof this.currentPage === 'number') {
        if (Platform.OS === 'ios') {
          this.scrollToPage(this.currentPage, true);
        } else {
          //A trick to solve bugs on Android. Delay a little
          setTimeout(this.scrollToPage.bind(this, this.currentPage, true), 0);
        }
      }
    }
  }

  settlePage(vy) {
    if (vy < -MIN_FLING_VELOCITY) {
      if (this.currentPage < this.pageCount - 1) {
        this.pageIndex = this.currentPage + 1;
        this.flingToPage(this.currentPage + 1, vy);
      } else {
        // this.pageIndex = this.currentPage - 1;
        this.flingToPage(this.pageCount - 1, vy);
      }
    } else if (vy > MIN_FLING_VELOCITY) {
      if (this.currentPage > 0) {
        this.pageIndex = this.currentPage - 1;
        this.flingToPage(this.currentPage - 1, vy);
      } else {
        this.flingToPage(0, vy);
        this.pageIndex = 0;
      }
    } else {
      let page = this.currentPage;
      let progress = (this.scroller.getCurrY() - this.getScrollOffsetOfPage(this.currentPage)) / this.state.height;
      if (progress > 1 / 3) {
        page += 1;
      } else if (progress < -1 / 3) {
        page -= 1;
      }
      page = Math.min(this.pageCount - 1, page);
      page = Math.max(0, page);
      this.pageIndex = page;
      this.scrollToPage(page);
    }
  }
  getPageIndex() {
    return this.pageIndex;
  }
  getScrollOffsetOfPage(page) {
    return page * (this.state.height + this.props.pageMargin);
  }
  getScrollHeght() {
    return this.height;
  }
  getScrollWidth() {
    return this.width;
  }
  flingToPage(page, velocityY) {
    this.onPageScrollStateChanged('settling');

    page = this.validPage(page);
    this.onPageChanged(page);

    velocityY *= -1000; //per sec
    const finalY = this.getScrollOffsetOfPage(page);
    this.scroller.fling(0, this.scroller.getCurrY(), 0, velocityY, 0, 0, finalY, finalY);

  }

  scrollToPage(page, immediate) {
    this.onPageScrollStateChanged('settling');
    page = this.validPage(page);
    this.onPageChanged(page);
    const finalY = this.getScrollOffsetOfPage(page);
    if (immediate) {
      this.scroller.startScroll(0, this.scroller.getCurrY(), 0, finalY - this.scroller.getCurrY(), 0);
    } else {
      this.scroller.startScroll(0, this.scroller.getCurrY(), 0, finalY - this.scroller.getCurrY(), 300);
    }

  }

  onPageChanged(page) {
    if (this.currentPage !== page) {
      this.currentPage = page;
      this.props.onPageSelected && this.props.onPageSelected(page);
    }
  }

  onPageScrollStateChanged(state) {
    this.props.onPageScrollStateChanged && this.props.onPageScrollStateChanged(state);
  }

  scrollByOffset(dy) {
    this.scroller.startScroll(0, this.scroller.getCurrY(), 0, -dy, 0);
  }
  validPage(page) {
    page = Math.min(this.pageCount - 1, page);
    page = Math.max(0, page);
    return page;
  }

  /**
   * A helper function to scroll to a specific page in the ViewPager.
   * @param page
   * @param immediate If true, the transition between pages will not be animated.
   */
  setPage(page, immediate) {
    this.scrollToPage(page, immediate);
  }

  getScrollOffsetFromCurrentPage() {
    return this.scroller.getCurrY() - this.getScrollOffsetOfPage(this.currentPage);
  }
}

/**
 * Keep in mind that if you use ES6 classes for your React components there is no built-in API for mixins. To use TimerMixin with ES6 classes, we recommend react-mixin.
 * Refer to 'https://facebook.github.io/react-native/docs/timers.html#content'
 */
reactMixin(ViewPager.prototype, TimerMixin);
