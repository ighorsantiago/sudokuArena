import * as Haptics from 'expo-haptics';

export function useHaptics() {
    async function vibrateError() {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    async function vibrateSuccess() {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    async function vibrateLight() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    return { vibrateError, vibrateSuccess, vibrateLight };
}
