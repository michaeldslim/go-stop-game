import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { SOUND_VOLUME_MAX, SOUND_VOLUME_MIN } from '../types/game';

interface SettingsVolumeSliderProps {
  label: string;
  value: number;
  disabled?: boolean;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
}

export function SettingsVolumeSlider({
  label,
  value,
  disabled = false,
  onValueChange,
  onSlidingComplete,
}: SettingsVolumeSliderProps) {
  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <Slider
        style={styles.slider}
        value={value}
        minimumValue={SOUND_VOLUME_MIN}
        maximumValue={SOUND_VOLUME_MAX}
        step={1}
        disabled={disabled}
        minimumTrackTintColor={colors.gold}
        maximumTrackTintColor="rgba(255,255,255,0.2)"
        thumbTintColor={colors.cream}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  disabled: {
    opacity: 0.45,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.cream,
    fontSize: 15,
    fontWeight: '600',
  },
  value: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'right',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
