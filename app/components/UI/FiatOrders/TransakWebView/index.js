import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, InteractionManager } from 'react-native';
import { WebView } from 'react-native-webview';
import { getTransakWebviewNavbar } from '../../../UI/Navbar';
import { baseStyles } from '../../../../styles/common';
import { handleTransakRedirect, TRANSAK_REDIRECT_URL } from '../orderProcessor/transak';
import { connect } from 'react-redux';
import NotificationManager from '../../../../core/NotificationManager';

class TransakWebView extends PureComponent {
	static navigationOptions = ({ navigation }) => getTransakWebviewNavbar(navigation);

	static propTypes = {
		navigation: PropTypes.object
	};

	handleNavigationStateChange = async navState => {
		if (navState.url.indexOf(TRANSAK_REDIRECT_URL) > -1) {
			const order = handleTransakRedirect(navState.url, this.props.network);
			this.props.addOrder(order);
			this.props.navigation.dismiss();
			InteractionManager.runAfterInteractions(() =>
				NotificationManager.showSimpleNotification({
					duration: 5000,
					title: `Processing purchase of ${order.currency}`,
					description: 'Your deposit is in progress',
					status: 'pending'
				})
			);
		}
	};

	render() {
		const uri = this.props.navigation.getParam('url', null);
		if (uri) {
			return (
				<View style={baseStyles.flexGrow}>
					<WebView source={{ uri }} onNavigationStateChange={this.handleNavigationStateChange} />
				</View>
			);
		}
	}
}

TransakWebView.propTypes = {
	network: PropTypes.string,
	addOrder: PropTypes.func
};

const mapStateToProps = state => ({
	network: state.engine.backgroundState.NetworkController.network
});

const mapDispatchToProps = dispatch => ({
	addOrder: order => dispatch({ type: 'FIAT_ADD_ORDER', payload: order })
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(TransakWebView);
