import React, { Component } from 'react';
import PropTypes from "prop-types";

import {
  View
} from 'react-native';
//TransformableImage
// import Image from 'react-native-transformable-image';
import ViewPager from '../common/ViewPager';
import Image from '../common/TransformableImage';
import { createResponder } from 'react-native-gesture-responder';
import FileHelper from '../../helpers/fileHelper.config.js';


export default class Gallery extends Component {

  static propTypes = {
    ...View.propTypes,
    images: PropTypes.array,

    initialPage: PropTypes.number,
    pageMargin: PropTypes.number,
    onPageSelected: PropTypes.func,
    onPageScrollStateChanged: PropTypes.func,
    onPageScroll: PropTypes.func,
    // onMomentumScrollEnd:PropTypes.func,
    onSingleTapConfirmed: PropTypes.func,
    onGalleryStateChanged: PropTypes.func,
    scrollTo: PropTypes.func,
    getPageIndex: PropTypes.func,
    iShorizontal: PropTypes.bool,
    downMove: PropTypes.func,
    upMove: PropTypes.func,
    // scrollTo:PropTypes.func,
  };
  static defaultProps = {
    iShorizontal: true,
  };
  imageRefs = new Map();
  activeResponder = undefined;
  firstMove = true;
  currentPage = 0;
  pageCount = 0;
  gestureResponder = undefined;
  isMoveEnd = false;
  tuchNumber = 0;
  constructor(props) {
    super(props);
  }
  UNSAFE_componentWillMount() {
    function onResponderReleaseOrTerminate(evt, gestureState) {
      let tisobj = this;
      let ty = this.shouldUpOrDownToNext(evt, gestureState);
      if (this.activeResponder) {
        // this.activeResponder === this.viewPagerResponder&& 
        if (this.activeResponder === this.viewPagerResponder
          && !this.shouldScrollViewPager(evt, gestureState)
          && Math.abs(gestureState.vx) > 0.5) {
          this.activeResponder.onEnd(evt, gestureState, true);
        }
        else {
          if (this.showToNextModel(evt, gestureState)) {
            // this.activeResponder.onEnd(evt, gestureState); 
            this.activeResponder.onEnd(evt, gestureState);
          } else if (ty != 0) {
            if (ty < 0) {
              if (this.activeResponder != this.activeImageResponder) {
                this.viewPagerResponder.onEnd(evt, gestureState);
              }
            }
            else {
              if (ty > 0) {
                if (this.activeResponder != this.activeImageResponder) {
                  this.viewPagerResponder.onEnd(evt, gestureState);
                }
              }
            }
          }
          else {
            this.activeResponder.onEnd(evt, gestureState);
          }
        }
        this.activeResponder = null;
      }
      this.firstMove = true;
      this.props.onGalleryStateChanged && this.props.onGalleryStateChanged(true);
    }
    this.gestureResponder = createResponder({
      onStartShouldSetResponderCapture: (evt, gestureState) => true,
      onStartShouldSetResponder: (evt, gestureState) => {
        return true;
      },
      onResponderGrant: (evt, gestureState) => {
        this.activeImageResponder(evt, gestureState);
      },
      onResponderMove: (evt, gestureState) => {
        if (this.firstMove) {
          this.firstMove = false;
          if (this.shouldUpOrDownToNext(evt, gestureState) != 0) {
            this.activeViewPagerResponder(evt, gestureState);
          }
          this.props.onGalleryStateChanged && this.props.onGalleryStateChanged(false);
        }
        if (this.activeResponder === this.viewPagerResponder) {
          const dx = gestureState.moveX - gestureState.previousMoveX;
          const dY = gestureState.moveY - gestureState.previousMoveY;
          const offset = this.getViewPagerInstance().getScrollOffsetFromCurrentPage();
          if (dY > 0 && offset > 0 && this.shouldUpOrDownToNext(evt, gestureState) == 0) {
            if (dY > offset) { // active image responder
              this.getViewPagerInstance().scrollByOffset(offset);
              gestureState.moveY -= offset;
              this.activeImageResponder(evt, gestureState);
            }
          } else if (dY < 0 && offset < 0 && this.shouldUpOrDownToNext(evt, gestureState) == 0) {
            if (dY < offset) { // active image responder
              this.getViewPagerInstance().scrollByOffset(offset);
              gestureState.moveY -= offset;
              this.activeImageResponder(evt, gestureState);
            }
          }
        }
        this.activeResponder.onMove(evt, gestureState);
      },
      onResponderRelease: onResponderReleaseOrTerminate.bind(this),
      onResponderTerminate: onResponderReleaseOrTerminate.bind(this),
      onResponderTerminationRequest: (evt, gestureState) => false, //Do not allow parent view to intercept gesture
      onResponderSingleTapConfirmed: (evt, gestureState) => {
        this.props.onSingleTapConfirmed && this.props.onSingleTapConfirmed(this.currentPage);
      }
    });
    this.viewPagerResponder = {
      onStart: (evt, gestureState) => {
        this.isMoveEnd = false;
        this.getViewPagerInstance().onResponderGrant(evt, gestureState);
        this.tuchNumber = gestureState.numberActiveTouches;
      },
      onMove: (evt, gestureState) => {
        this.getViewPagerInstance().onResponderMove(evt, gestureState);
        if (gestureState.numberActiveTouches > this.tuchNumber)
          this.tuchNumber = gestureState.numberActiveTouches;
      },
      onEnd: (evt, gestureState, disableSettle) => {
        this.getViewPagerInstance().onResponderRelease(evt, gestureState, disableSettle);
      }
    }
    this.imageResponder = {
      onStart: ((evt, gestureState) => {
        this.isMoveEnd = false;
        this.getCurrentImageTransformer().onResponderGrant(evt, gestureState);
        this.tuchNumber = gestureState.numberActiveTouches;
      }),
      onMove: (evt, gestureState) => {

        this.getCurrentImageTransformer().onResponderMove(evt, gestureState);
        if (gestureState.numberActiveTouches > this.tuchNumber)
          this.tuchNumber = gestureState.numberActiveTouches;
      },
      onEnd: (evt, gestureState) => {
        this.isMoveEnd = true;
        this.getCurrentImageTransformer().onResponderRelease(evt, gestureState);
      }
    }
  }
  showToNextModel(evt, gestureState) {
    tisobj = this;
    if (this.tuchNumber > 1) {
      return true;
    } else {
      const viewTransformer = this.getCurrentImageTransformer();
      const space = viewTransformer.getAvailableTranslateSpace();
      const dx = gestureState.moveX - gestureState.previousMoveX;
      const dY = Math.abs(gestureState.moveY - gestureState.previousMoveY);
      const vy = Math.abs(gestureState.vy);
      const vx = Math.abs(gestureState.vx);
      const lengthx = Math.abs(dx);
      if (dx > 0 && space.left <= 0 && dY < lengthx && lengthx > 5) {
        if (tisobj.props.downMove) {
          tisobj.props.downMove();
        }
        return true;
      }
      if (dx < 0 && space.right <= 0 && dY < lengthx && lengthx > 5) {
        if (tisobj.props.upMove) {
          tisobj.props.upMove();
        }
        return true;
      }
      return false;
    }
  }
  shouldScrollViewPager(evt, gestureState) {
    if (gestureState.numberActiveTouches > 1) {
      return false;
    }
    const viewTransformer = this.getCurrentImageTransformer();
    const space = viewTransformer.getAvailableTranslateSpace();
    const dx = gestureState.moveX - gestureState.previousMoveX;

    if (dx > 0 && space.left <= 0 && this.currentPage > 0) {
      return true;
    }
    if (dx < 0 && space.right <= 0 && this.currentPage < this.pageCount - 1) {
      return true;
    }
    return false;
  }
  shouldUpOrDownToNext(evt, gestureState) {
    if (this.tuchNumber > 1) {
      return 0;
    }
    if (Math.abs(gestureState.vy) < Math.abs(gestureState.vx)) return 0;

    const viewTransformer = this.getCurrentImageTransformer();
    const space = viewTransformer.getAvailableTranslateSpace();
    const dy = gestureState.moveY - gestureState.previousMoveY;
    if (dy == 0) return 0;
    if (dy > 0) {
      return space.top > 0 && this.currentPage <= 0 ? 0 : 1;
    }
    else {
      return space.bottom > 0 && this.currentPage >= this.pageCount - 1 ? 0 : -1;
    }
  }
  activeImageResponder(evt, gestureState) {
    if (this.activeResponder !== this.imageResponder) {
      if (this.activeResponder === this.viewPagerResponder) {
        this.viewPagerResponder.onEnd(evt, gestureState, true); //pass true to disable ViewPager settle
      }
      this.activeResponder = this.imageResponder;
      this.imageResponder.onStart(evt, gestureState);
    }
  }
  activeViewPagerResponder(evt, gestureState) {
    if (this.activeResponder !== this.viewPagerResponder) {
      if (this.activeResponder === this.imageResponder) {
        this.imageResponder.onEnd(evt, gestureState);
      }
      this.activeResponder = this.viewPagerResponder;
      this.viewPagerResponder.onStart(evt, gestureState)
    }
  }
  getImageTransformer(page) {
    if (page >= 0 && page < this.pageCount) {
      let ref = this.imageRefs.get(page + '');
      if (ref) {
        return ref.getViewTransformerInstance();
      }
    }
  }
  getCurrentImageTransformer() {
    return this.getImageTransformer(this.currentPage);
  }
  componentDidMount() {

  }
  getViewPagerInstance() {
    return this.refs['galleryViewPager'];
  }

  render() {
    let gestureResponder = this.gestureResponder;
    let images = this.props.images;
    // this.getImageUrl().then((uri)=>{
    //   images = uri
    // });
    if (!images) {
      images = [];
    }
    this.pageCount = images.length;

    if (this.pageCount <= 0) {
      gestureResponder = {};
    }
    var myDate = new Date();
    return (
      <ViewPager
        {...this.props}
        ref='galleryViewPager'
        key={myDate + myDate.getMilliseconds()}
        scrollEnabled={false}
        renderPage={this.renderPage.bind(this)}
        pageDataArray={images}
        style={this.props.style}
        {...gestureResponder}
        onPageSelected={this.onPageSelected.bind(this)}
        onPageScrollStateChanged={this.onPageScrollStateChanged.bind(this)}
        onPageScroll={this.onPageScroll.bind(this)}
        iShorizontal={this.props.iShorizontal}
      /* scrollTo={this.scrollTo.bind(this)} */
      />
    );
  }
  getPageIndex() {
    return this.refs['galleryViewPager'].getPageIndex();
    // return this.currentPage
  }
  onPageSelected(page) {
    this.currentPage = page;
    this.props.onPageSelected && this.props.onPageSelected(page);
  }

  onPageScrollStateChanged(state) {
    if (state === 'idle') {
      this.resetHistoryImageTransform();
    }
    this.props.onPageScrollStateChanged && this.props.onPageScrollStateChanged(state);
  }
  onPageScroll(e) {
    this.props.onPageScroll && this.props.onPageScroll(e);
  }
  scrollTo(index, immediate) {
    this.refs['galleryViewPager'].setPage(index, immediate);
  }
  renderPage(pageData, pageId, layout) {

    const { onViewTransformed, onTransformGestureReleased, ...other } = this.props;
    return (
      <Image
        {...other}
        onViewTransformed={((transform) => {
          onViewTransformed && onViewTransformed(transform, pageId);
        }).bind(this)}
        onTransformGestureReleased={((transform) => {
          onTransformGestureReleased && onTransformGestureReleased(transform, pageId);
        }).bind(this)}
        ref={((ref) => {
          this.imageRefs.set(pageId, ref);
        }).bind(this)}
        key={'innerImage#' + pageId}
        style={{ width: layout.width, height: layout.height }}
        source={pageData}
        pageId={pageId}
      />
    );
  }

  resetHistoryImageTransform() {
    let transformer = this.getImageTransformer(this.currentPage + 1);
    if (transformer) {
      transformer.forceUpdateTransform({ scale: 1, translateX: 0, translateY: 0 });
    }

    transformer = this.getImageTransformer(this.currentPage - 1);
    if (transformer) {
      transformer.forceUpdateTransform({ scale: 1, translateX: 0, translateY: 0 });
    }
  }
}
