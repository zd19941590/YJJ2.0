/**
 * Created by jean.h.ma on 18/07/2017.
 */
import React from "react";
import BaseComponent from "./BaseComponent";
import { View, Text, ActivityIndicator, StyleSheet, Animated, Platform } from "react-native";
import PropTypes from "prop-types";

const animationPositionDistance = 10;

class AnimationCube extends BaseComponent {
	static propTypes = {
		position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
		style: PropTypes.any
	};

	constructor(props) {
		super(props);
		this.state = {
			rotate: new Animated.Value(0),
			translateX: new Animated.Value(0),
			translateY: new Animated.Value(0)
		};
	}

	render() {
		const rotate = this.state.rotate.interpolate({
			inputRange: [0, 1],
			outputRange: ['0deg', '90deg']
		});
		let left = 19;
		let top = 19;
		if (this.props.position === "right") {
			left += 16;
		}
		else if (this.props.position === "bottom") {
			left += 16;
			top += 16;
		}
		else if (this.props.position === "left") {
			top += 16;
		}
		return (
			<Animated.View
				style={[this.props.style, styles.item, { left, top }, { transform: [{ translateX: this.state.translateX }, { translateY: this.state.translateY }, { rotate: rotate }] }]}></Animated.View>
		);
	}

	componentDidMount() {
		super.componentDidMount();
		const outAnimation = Animated.parallel([
			Animated.timing(this.state.rotate, {
				toValue: 1
			}),
			Animated.timing(this.state.translateX, {
				toValue: this.props.position === "left" || this.props.position === "top" ? -animationPositionDistance : animationPositionDistance
			}),
			Animated.timing(this.state.translateY, {
				toValue: this.props.position === "right" || this.props.position === "top" ? -animationPositionDistance : animationPositionDistance
			})
		]);
		const inAnimation = Animated.parallel([
			Animated.timing(this.state.translateX, { toValue: 0 }),
			Animated.timing(this.state.translateY, { toValue: 0 }),
		]);

		const animation = Animated.sequence([
			outAnimation,
			inAnimation
		]);
		Animated.loop(animation).start();
	}
}

export default class Indicator extends BaseComponent {
	static propTypes = {
		cubeStyle: PropTypes.any
	};
	static defaultProps = {
		cubeStyle: {
			backgroundColor: "#40A8CC"
		}
	};

	render() {
		return (
			<View style={styles.content}>
				<AnimationCube position="top" style={this.props.cubeStyle} />
				<AnimationCube position="right" style={this.props.cubeStyle} />
				<AnimationCube position="left" style={this.props.cubeStyle} />
				<AnimationCube position="bottom" style={this.props.cubeStyle} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	content: {
		width: 70,
		height: 70,
		flexDirection: "row",
		flexWrap: "wrap",
		transform: [{
			rotate: "45deg"
		}],
	},
	item: {
		width: 16,
		height: 16,
		position: "absolute",
	}
});