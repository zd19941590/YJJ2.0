/**
 * Created by jean.h.ma on 19/05/2017.
 */
import React, { Component, PureComponent } from 'react'
import update from 'immutability-helper'

export default class BaseComponent extends Component {
	constructor(props) {
		super(props);
		this._mounted = false;
	}

	componentDidMount() {
		this._mounted = true;
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	updateState(state: ImmutableHelperObject, callback: Function) {
		if (this._mounted) {
			if (this.state) {
				let newState = update(this.state, state);
				this.setState(
					newState,
					callback
				);
			}
		}
	}

	setStateIfNotDidMount(state: Object, callback: Function) {
		if (this._mounted) {
			this.setState(state, callback);
		}
	}
}

export class BasePureComponent extends PureComponent {
	constructor(props) {
		super(props);
		this._mounted = false;
	}

	componentDidMount() {
		this._mounted = true;
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	updateState(state: ImmutableHelperObject, callback: Function) {
		if (this._mounted) {
			if (this.state) {
				this.setState(
					update(this.state, state),
					callback
				);
			}
		}
	}

	setStateIfNotDidMount(state: Object, callback: Function) {
		if (this._mounted) {
			this.setState(state, callback);
		}
	}
}