import React, { Component } from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';
import CompanyConfig from '../../config/company.config.js';
import ProductListAllCPT from './productlist.js';

let productStyles = null;

function setStyle() {
    if (productStyles != null && !CompanyConfig.isGeneral()) return productStyles;

    productStyles = StyleSheet.create({
        baseView: {
            flex: 1,
            backgroundColor: CompanyConfig.AppColor.PageBackground,
        },
    });

    return productStyles;
}
/**
 * product list page
 */
export default class ProductListPage extends Component {
    constructor(prop) {
        super(prop);
        this.state = {
        }

    }

    render() {
        setStyle();
        return (
            <View style={productStyles.baseView}>
                <ProductListAllCPT navigation={this.props.navigation} categorySysNo={null} />
            </View>
        );
    }
}

