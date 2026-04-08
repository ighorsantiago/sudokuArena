import { useEffect, useRef, useState } from 'react';
import {
    AdEventType,
    InterstitialAd,
    RewardedAd,
    RewardedAdEventType
} from 'react-native-google-mobile-ads';

// ─── IDs de produção ──────────────────────────────────────────────────────────
const AD_UNIT_IDS = {
    banner: 'ca-app-pub-3386298011801498/6736080763',
    interstitial: 'ca-app-pub-3386298011801498/7922642102',
    rewarded: 'ca-app-pub-3386298011801498/4461271218',
};

// ─── Interstitial ─────────────────────────────────────────────────────────────

export function useInterstitialAd() {
    const interstitial = useRef(
        InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, {
            requestNonPersonalizedAdsOnly: true,
        })
    );
    const [loaded, setLoaded] = useState(false);
    const gamesCount = useRef(0);

    useEffect(() => {
        const unsubscribeLoaded = interstitial.current.addAdEventListener(
            AdEventType.LOADED,
            () => setLoaded(true)
        );
        const unsubscribeClosed = interstitial.current.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                setLoaded(false);
                interstitial.current.load();
            }
        );

        interstitial.current.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
        };
    }, []);

    function onGameStarted() {
        gamesCount.current += 1;
        if (gamesCount.current % 3 === 0 && loaded) {
            interstitial.current.show();
        }
    }

    return { onGameStarted };
}

// ─── Rewarded ─────────────────────────────────────────────────────────────────

export function useRewardedAd(onRewarded: () => void) {
    const rewarded = useRef(
        RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded, {
            requestNonPersonalizedAdsOnly: true,
        })
    );
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const unsubscribeLoaded = rewarded.current.addAdEventListener(
            RewardedAdEventType.LOADED,
            () => setLoaded(true)
        );
        const unsubscribeEarned = rewarded.current.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            () => onRewarded()
        );
        const unsubscribeClosed = rewarded.current.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                setLoaded(false);
                rewarded.current.load();
            }
        );

        rewarded.current.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
            unsubscribeClosed();
        };
    }, [onRewarded]);

    function showAd() {
        if (loaded) {
            rewarded.current.show();
        }
    }

    return { loaded, showAd };
}
