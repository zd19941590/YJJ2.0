/**
 * Created by jean.h.ma on 05/07/2017.
 */

import React, {Component} from "react";
import {AsyncStorage} from "react-native";

let _env = null;


export default class WaitingForReady extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ready: false
		};
		
		AsyncStorage.getItem("env").then(value=> {
			_env = value;
			this.setState({
				ready: true
			});
		});
	}

	render() {
		if (this.state.ready) {
			let APP = require('./APP').default;
			return <APP/>
		}
		return null;
	}
}
