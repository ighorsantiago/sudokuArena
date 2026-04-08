import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { Colors } from '../constants/theme';

const BANNER_ID = 'ca-app-pub-3386298011801498/6736080763';

export function AdBanner() {
    return (
        <View style={styles.container}>
            <BannerAd
                unitId={BANNER_ID}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
});
